import { Params } from '../modules/types';

const armorOptions = {
    none: "None",
    light: "Light",
    medium: "Medium",
    heavy: "Heavy"
}

const protectionOptions = {
    none: "None",
    soft: "Soft-kill",
    hard: "Hard-kill APS",
    both: "Soft-kill and Hard-kill APS"
}

type ArmorType = keyof typeof armorOptions
type ProtectionType = keyof typeof protectionOptions

export type GroundRateInput = {
    length: number,
    armor: ArmorType,
    protection: ProtectionType,
    heavy: number,
    medium: number,
    light: number,
    rocket: number,
    shield: boolean,
    systems: number
}

const params: Params = {
    length: {id: "length", label: "Length", type: "number", num_type: "ufloat", default: 10},
    armor: {id: "armor", label: "Armor", type: "select", options: armorOptions, default: "none"},
    protection: {id: "protection", label: "Protection", type: "select", options: protectionOptions, default: "none"},
    heavy: {id: "heavy", label: "Heavy Weapons", type: "number", num_type: "uint", default: 0},
    medium: {id: "medium", label: "Medium Weapons", type: "number", num_type: "uint", default: 0},
    light: {id: "light", label: "Light Weapons", type: "number", num_type: "uint", default: 0},
    rocket: {id: "rocket", label: "Rocket Weapons", type: "number", num_type: "uint", default: 0},
    shield: {id: "shield", label: "Shield", type: "bool", default: false},
    systems: {id: "systems", label: "Systems", type: "number", num_type: "uint", default: 0}
}

const armorCosts = { //Costs are seemingly inverted
    heavy: {ER: 24, CM: 90, EL: 30, CS: 40},
    medium: {ER: 26, CM: 50, EL: 20, CS: 30},
    light: {ER: 40, CM: 30, EL: 12.5, CS: 20},
    none: {ER: 100, CM: 20, EL: 10, CS: 10}
}

const protectionCosts = { //Not inverted
    both: {ER: 0.3, CM: 20, EL: 25},
    hard: {ER: 0.15, CM: 10, EL: 10},
    soft: {ER: 0.1, CM: 5, EL: 15},
    none: {ER: 0, CM: 0, EL: 0}
}

const er = (values: GroundRateInput) => {
    const {length, armor, protection, heavy, medium, light, rocket, systems, shield} = values;

    const weaponSystemCost = 
        (heavy > 0) ? 7 :
        (medium > 0) ? 3 : 0;

    const lengthCostER = length ** 2 / (armorCosts[armor].ER - weaponSystemCost);

    const heavyCostER = heavy * 0.9;
    const mediumCostER = medium * 0.3;
    const lightCostER = light * 0.03;
    const rocketCostER = rocket * 0.08;
    const shieldCostER = shield ? 1 : 0;

    const systemCostER = 1 + systems * 0.1 + protectionCosts[protection].ER;

    return Math.ceil(systemCostER * (lengthCostER + heavyCostER + mediumCostER + lightCostER + rocketCostER + shieldCostER) * 100) / 100;
}

const cm = (values: GroundRateInput) => {
    const {length, armor, protection, heavy, medium, light, rocket, shield, systems} = values;

    const lengthCostCM = length ** 2 / 8.5 + armorCosts[armor].CM + protectionCosts[protection].CM;
    
    const heavyCostCM = heavy * 10;
    const mediumCostCM = medium * 2;
    const lightCostCM = light * 0.3;
    const rocketCostCM = rocket;
	const shieldCostCM = shield ? 5 : 0;

    const systemCostCM = systems + 1;

    return Math.ceil(Math.ceil(systemCostCM * (lengthCostCM + heavyCostCM + mediumCostCM + lightCostCM + rocketCostCM + shieldCostCM) * 20) / 100);
}

const el = (values: GroundRateInput) => {
    const {length, armor, protection, heavy, medium, light, rocket, shield, systems} = values;

    const lengthCostEL = 3 * (length ** 2 / 85 + armorCosts[armor].EL + protectionCosts[protection].EL);
    
    const heavyCostEL = heavy * 6;
    const mediumCostEL = medium * 10;
    const lightCostEL = light * 0.2;
    const rocketCostEL = rocket * 0.2;
    const systemCostEL = systems * 1.5 + 1;
	
	const finalEL = shield ? 
        systemCostEL * (lengthCostEL + heavyCostEL + mediumCostEL + lightCostEL + rocketCostEL) * 1.1 + 30 
        : systemCostEL * (lengthCostEL + heavyCostEL + mediumCostEL + lightCostEL + rocketCostEL)

    return Math.ceil(Math.ceil(finalEL * 20) / 100);
}

const cs = (values: GroundRateInput, costCM: number, costEL: number) => {
    const {armor, heavy, medium, light, rocket, systems} = values;
    
    const CSCostID = 
        (heavy > 0 || rocket > 0) ? 4 :
        (medium > 0) ? 3 :
        (light > 0) ? 2 : 1;
    
    const lengthCostCS =
        (CSCostID === 4 || armorCosts[armor].CS === 4) ? 50 :
        (CSCostID === 3 || armorCosts[armor].CS === 3) ? 30 :
        (CSCostID === 2 || armorCosts[armor].CS === 2) ? 15 : 10;

    const systemCostCS = systems * 2.5;

    return Math.ceil(Math.ceil((lengthCostCS + systemCostCS + 0.1 * (costCM + costEL)) * 20) / 100);
}

const rate = (value: GroundRateInput) => {
    const er_cost = er(value) * (10**6);
    const cm_cost = cm(value);
    const el_cost = el(value);
    const cs_cost = cs(value, cm_cost, el_cost);
    const cs_upkeep = Math.ceil(cs_cost / 6);

    return {
        er: er_cost,
        cm: cm_cost,
        el: el_cost,
        cs: cs_cost,
        cs_upkeep: cs_upkeep
    }
}

export default {
    rate: rate,
    params: params
}