import { objectReduce, objectMap, split } from './functions';
import { 
    subResources,
    addResources, mulResources, roundResources,
    economicCountBuildings, scaleResources } from './resourceMath';

export const defaultResources = (resources) => {
    if (resources === undefined || resources.length === 0) return {};
    const resouceObject = {};
    
    for (const name of resources) {
        resouceObject[name] = 0;
    }
    
    return resouceObject;
}

    const calculateCapacitiesOnWorld = (settingsPlanet, planet, buildings, blankStorage, blankCapacities) => 
    planet.Buildings.reduce(
        (acc, building, index) => {
            if (building === null) return acc;
            const count = economicCountBuildings(building);

            const capacities = roundResources(addResources(mulResources(scaleResources(buildings[index].capacity, count), scaleResources(settingsPlanet.Resources, 1/100)), acc.capacities));
            const storage = roundResources(addResources(scaleResources(buildings[index].storage, count),acc.storage));
        
            return {storage, capacities};
        }
        , {storage: blankStorage, capacities: blankCapacities}
    )

export const calculateCapacities = (faction, settingMaps, blankStorage, blankCapacities) => {
    const {storage, capacities} = objectReduce(faction.Buildings,
        (acc, map, name) => {
            const {storage, capacities} = calculateCapacitiesOnWorld(settingMaps[name], map, faction.Buildings, blankStorage, blankCapacities);
            const ucs = settingMaps[name].Resources["U-CS"];
            let population = {Population: map.Hexes * (ucs === 0 ? 0 : ucs < 80 ? 200000 : 300000)};

            return {
                storage: addResources(addResources(storage, acc.storage), population),
                capacities: addResources(capacities, acc.capacities)
            }
        },
        {storage: blankStorage, capacities: blankCapacities}
    )
    return {...faction, Storage: storage, Capacities: capacities};
}

export const calculateInfluence = (res, usages, maps) => { 
    const hexCount = objectReduce(maps, (count, map) => count + map.Hexes, 0)
    const influenceIncome = usages.Influence; // Influence Income changes from pacts and human events.
    const influence = Math.max(2500 - 0.25*hexCount, 50) - influenceIncome;
    return Math.min(influence, 10000 - res.Influence)
}

const calculatePopulation = (res) => {
    const consumableInfluence = res.CS * 5000/ res.Population;
    const populationGrowth = 
       consumableInfluence <= 0.5 ? -5
       : consumableInfluence <= 1 ? (consumableInfluence - 1)*1
       : consumableInfluence <= 2 ? (consumableInfluence - 1)*5
       : 5;
    const population = res.Population*populationGrowth*2/100;
    return population;
}

const calculateERIncome = (Resources) => {
    const treasury = Resources.ER
    const workingPopulation = Resources.Population - Resources.Military
    const percentage = 
        treasury <= 1000000000000 ? 100
        : treasury <= 15000000000000 ? (-0.005714*(treasury/1000000000 - 1000)+100)
        : (22 - Math.log10((treasury/1000000000 - 5699))/2)
    const income = percentage/100 * (
        workingPopulation <= 250000000 ? 245 * workingPopulation/210 *1000 - 41666666666
        : 1000000000*((1.7 * Math.log10(workingPopulation + 1))**2 + 46.18193)
    )

    // console.log(treasury, workingPopulation, percentage, income)
    return Math.max(Math.round(income),5000000000);
}

const calculateUnrefinedIncome = (faction) => {
    const {Resources, Capacities, Usages} = faction;

    const [unrefined, _, __] = split(Object.keys(Resources));

    const income = objectMap(defaultResources(unrefined), 
        (_, name) => Math.max((Capacities[name] ?? 0)  - (Usages[name] ?? 0), 0));

    return roundResources(income);
}

const calculateRefinedIncome = (faction, trades, name) => {
    const {Resources, Capacities, Usages, Storage: store, Fleets} = faction;
    const CSCost = Resources.Population/50000 + Fleets.reduce((a, f) => a + f.CSCost,0);

    const orderedTrades = new Map();
    trades.forEach((trade) => orderedTrades.set(trade.ID, trade),[]);
    
    const storage = 
        faction.Trades.map(id => orderedTrades.get(id) ?? false).filter(trade => Boolean(trade))
            .map((trade) => {
                return trade[name].Resources;
            })
            .reduce((acc, trade) => addResources(acc, trade), //Adds all trades to storage for calculation
            {...store, CS: store.CS + CSCost})//Includes CS used by Pop

    const [unrefined, refined, _] = split(Object.keys(Resources));

    const income = objectMap(defaultResources(refined), 
        (_, name) => {
            return Math.min((Capacities[name] ?? 0) - (Usages[name] ?? 0), Resources[`U-${name}`], storage[name] - Resources[name]);
        });

    const unrefinedCost = objectMap(defaultResources(unrefined), (_, name) => -income[name.slice(2)])


    return roundResources({...unrefinedCost, ...income, CS: income.CS - CSCost});
}

const calculateUniqueIncome = (faction) => {
    const {Resources, Capacities, Usages, Maps} = faction;

    const [_, __, unique] = split(Object.keys(Resources));

    const income = objectMap(defaultResources(unique),
        (_, name) => {
            switch (name) {
                case "Influence": return calculateInfluence(Resources, Usages, Maps);
                case "Population": return calculatePopulation(Resources, Capacities);
                case "ER": return calculateERIncome(Resources);
                default: return 0;
            }
        }
    );

    return roundResources(income);
}

const fastTrade = (faction, trades, name) => {
    const orderedTrades = [];
    trades.forEach((trade) => orderedTrades[trade.ID] = trade);

    const resources = 
        faction.Trades.map(id => orderedTrades[id] ?? false).filter(trade => Boolean(trade))
            .map((trade) => {
                const target = Object.keys(trade).filter(key => key !== 'ID' || key === name)[0];
                return subResources(trade[target].Resources, trade[name].Resources);
            })
            .reduce((acc, trade) => addResources(acc, trade), faction.Resources)

    return {...faction, Resources: resources};
}

export const calculateIncome = (faction, trades, name, doTrades) => {
    const tradedFaction = doTrades ? fastTrade(faction, trades, name): faction;

    const unrefinedFaction = {
        ...tradedFaction,
        Resources: addResources(tradedFaction.Resources, calculateUnrefinedIncome(tradedFaction))
    };

    const refinedFaction = {
        ...unrefinedFaction,
        Resources: addResources(unrefinedFaction.Resources, calculateRefinedIncome(unrefinedFaction, [], name))
    };

    const finalResources = addResources(refinedFaction.Resources, calculateUniqueIncome(refinedFaction));

    return subResources(finalResources, faction.Resources);
}