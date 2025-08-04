import { VehicleCost, Params } from '../modules/types';

const missile_types = {
    cruise: "Cruise",
    gto: "Ground to Orbit",
    ip: "Interplanetary",
    ballistic: "Ballistic",
    interceptor: "Interceptor"
}

type MissileType = keyof typeof missile_types

export type MissileRateInput = {
    length: number,
    type: MissileType,
    nuclear: number,
    systems: number
}

const params: Params = {
    length: {id: "length", label: "Length", num_type: "ufloat", type: "number"},
    type: {id: "type", label: "Missile Type", type: "select", options: missile_types},
    nuclear: {id: "nuclear", label: "Nuclear Yield (kilotons)", num_type: "uint", type: 'number'},
    systems: {id: "systems", label: "Systems", num_type: "uint", type: 'number'}
}

const typeCosts = { //Costs are seemingly inverted
    interceptor: {ER: 4.2, CM: 23, EL: 19, CS: 18},
    ballistic: {ER: 67, CM: 89, EL: 52, CS: 62},
    ip: {ER: 79, CM: 87, EL: 65, CS: 72},
    gto: {ER: 67, CM: 45, EL: 54, CS: 42},
	cruise: {ER: 1.5, CM: 45, EL: 13, CS: 6}
}

const er = (values: MissileRateInput) => {
    const {length, type, nuclear} = values;

    const lengthCostER = length*1.7;
    const typeCostER = typeCosts[type].ER;
    const nuclearER = nuclear*8.6;

    return Math.ceil((lengthCostER+typeCostER+nuclearER)/2);
}

const cm = (values: MissileRateInput) => {
    const {length, type, nuclear} = values;

    const lengthCostCM = length*3.8;
    const typeCostCM = typeCosts[type].CM;
    const nuclearCM = nuclear*16;

    return Math.ceil((lengthCostCM+typeCostCM+nuclearCM)/2);
}

const el = (values: MissileRateInput) => {
    const {type, nuclear, systems} = values;

    const typeCostEL = typeCosts[type].EL;
    const nuclearEL = nuclear*8;
	const systemsEL = 2.5*typeCosts[type].EL*systems;
	
    return Math.ceil((typeCostEL+nuclearEL+systemsEL)/2);
}

const cs = (values: MissileRateInput) => {
    const {length, type, nuclear} = values;

    const lengthCostCS = length*1.6;
    const typeCostCS = typeCosts[type].CS;
    const nuclearCS = nuclear*3.5;

    return Math.ceil((lengthCostCS+typeCostCS+nuclearCS)/2);
}

const rate = (values: MissileRateInput): VehicleCost => {


    return {
        er: Math.ceil(er(values) * (10**6)),
        cm: Math.ceil(cm(values)),
        cs: Math.ceil(cs(values)),
        el: Math.ceil(el(values)),
        cs_upkeep: Math.ceil(cs(values) / 6)
    }
}

export default {
    rate: rate,
    params: params
}