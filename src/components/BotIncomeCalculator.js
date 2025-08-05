// Bot's actual income calculation logic copied from incomeMath.js
export const calculateBotIncome = (faction, trades, name, doTrades) => {
  // Helper functions from bot
  const defaultResources = (keys) =>
    keys.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
  
  const split = (resources = []) => {
    const unrefined = resources.filter((v) => v.startsWith("U-"));
    const refined = unrefined.map((str) => str.slice(2));
    const refinedMap = new Set(refined);
    const unique = resources.filter(
      (str) => !refinedMap.has(str) && !refinedMap.has(str.slice(2))
    );
    return [unrefined, refined, unique];
  };

  const addResources = (a, b) => {
    const result = { ...a };
    Object.keys(b || {}).forEach(key => {
      result[key] = (result[key] || 0) + (b[key] || 0);
    });
    return result;
  };

  const subResources = (a, b) => {
    const result = { ...a };
    Object.keys(b || {}).forEach(key => {
      result[key] = (result[key] || 0) - (b[key] || 0);
    });
    return result;
  };

  const roundResources = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Math.round(v)]));

  // Fast trade logic from bot
  const fastTrade = (faction, trades, name) => {
    const orderedTrades = [];
    trades.forEach((trade) => orderedTrades[trade.ID] = trade);

    const resources = 
      (faction.Trades || []).map(id => orderedTrades[id] ?? false).filter(trade => Boolean(trade))
        .map((trade) => {
          const target = Object.keys(trade).filter(key => key !== 'ID' && key !== name)[0];
          return subResources((trade[target] || {}).Resources || {}, (trade[name] || {}).Resources || {});
        })
        .reduce((acc, trade) => addResources(acc, trade), faction.Resources || {});

    return { ...faction, Resources: resources };
  };

  // Calculate unrefined income
  const calculateUnrefinedIncome = (faction) => {
    const { Resources = {}, Capacities = {}, Usages = {} } = faction;
    const [unrefined] = split(Object.keys(Resources));
    
    const income = Object.fromEntries(
      unrefined.map(name => [
        name,
        Math.max((Capacities[name] ?? 0) - (Usages[name] ?? 0), 0)
      ])
    );
    
    return roundResources(income);
  };

  // Calculate refined income
  const calculateRefinedIncome = (faction, trades, name) => {
    const { Resources = {}, Capacities = {}, Usages = {}, Storage: store = {}, Fleets = [] } = faction;
    const CSCost = (Resources.Population || 0) / 50000 + Fleets.reduce((a, f) => a + (f.CSCost || 0), 0);

    const orderedTrades = new Map();
    trades.forEach((trade) => orderedTrades.set(trade.ID, trade));
    
    const storage = 
      (faction.Trades || []).map(id => orderedTrades.get(id) ?? false).filter(trade => Boolean(trade))
        .map((trade) => {
          return (trade[name] || {}).Resources || {};
        })
        .reduce((acc, trade) => addResources(acc, trade), 
        { ...store, CS: (store.CS || 0) + CSCost });

    const [unrefined, refined] = split(Object.keys(Resources));

    const income = Object.fromEntries(
      refined.map(name => [
        name,
        Math.min(
          (Capacities[name] ?? 0) - (Usages[name] ?? 0), 
          Resources[`U-${name}`] || 0, 
          (storage[name] || 0) - (Resources[name] || 0)
        )
      ])
    );

    const unrefinedCost = Object.fromEntries(
      unrefined.map(name => [name, -(income[name.slice(2)] || 0)])
    );

    return roundResources({ ...unrefinedCost, ...income, CS: (income.CS || 0) - CSCost });
  };

  // Calculate unique income
  const calculateUniqueIncome = (faction) => {
    const { Resources = {}, Usages = {}, Maps = {} } = faction;
    const [,, unique] = split(Object.keys(Resources));

    const calculateInfluence = (res, usages, maps) => {
      const hexCount = Object.values(maps || {}).reduce((count, map) => count + ((map || {}).Hexes || 0), 0);
      const influenceIncome = (usages && usages.Influence) || 0;
      const influence = Math.max(2500 - 0.25 * hexCount, 50) - influenceIncome;
      return Math.min(influence, 10000 - (res.Influence || 0));
    };

    const calculatePopulation = (res) => {
      const consumableInfluence = ((res.CS || 0) * 5000) / (res.Population || 1);
      const populationGrowth =
        consumableInfluence <= 0.5 ? -5
        : consumableInfluence <= 1 ? (consumableInfluence - 1) * 1
        : consumableInfluence <= 2 ? (consumableInfluence - 1) * 5
        : 5;
      return ((res.Population || 0) * populationGrowth * 2) / 100;
    };

    const calculateERIncome = (Resources) => {
      const treasury = Resources.ER || 0;
      const workingPopulation = (Resources.Population || 0) - (Resources.Military || 0);
      const percentage =
        treasury <= 1000000000000 ? 100
        : treasury <= 15000000000000 ? (-0.005714 * (treasury / 1000000000 - 1000) + 100)
        : (22 - Math.log10((treasury / 1000000000 - 5699)) / 2);
      const income = (percentage / 100) * (
        workingPopulation <= 250000000 ? 245 * workingPopulation / 210 * 1000 - 41666666666
        : 1000000000 * ((1.7 * Math.log10(workingPopulation + 1)) ** 2 + 46.18193)
      );
      return Math.max(Math.round(income), 5000000000);
    };

    const income = Object.fromEntries(
      unique.map(name => {
        switch (name) {
          case "Influence": return [name, calculateInfluence(Resources, Usages, Maps)];
          case "Population": return [name, calculatePopulation(Resources)];
          case "ER": return [name, calculateERIncome(Resources)];
          default: return [name, 0];
        }
      })
    );

    return roundResources(income);
  };

  // Main calculation logic (from bot's calculateIncome function)
  const tradedFaction = doTrades ? fastTrade(faction, trades, name.toLowerCase()) : faction;

  const unrefinedFaction = {
    ...tradedFaction,
    Resources: addResources(tradedFaction.Resources || {}, calculateUnrefinedIncome(tradedFaction))
  };

  const refinedFaction = {
    ...unrefinedFaction,
    Resources: addResources(unrefinedFaction.Resources || {}, calculateRefinedIncome(unrefinedFaction, [], name))
  };

  const finalResources = addResources(refinedFaction.Resources || {}, calculateUniqueIncome(refinedFaction));

  return subResources(finalResources, faction.Resources || {});
};
