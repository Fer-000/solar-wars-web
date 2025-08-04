import { InfantryCost, Params } from '../modules/types';

const speciesOptions = {
    human: "Human",
    robot: "Robot", 
    catperson: "Catperson"
}

const primaryWeaponOptions = {
    assaultrifle: "Assault Rifle",
    machinegun: "Machine Gun",
    sniperrifle: "Sniper Rifle",
    sword: "Sword",
    staff: "Staff"
}

const camoOptions = {
    none: "None",
    regular: "Regular",
    semiactive: "Semi-Active",
    active: "Active"
}

const secondaryWeaponOptions = {
    none: "None",
    pistol: "Pistol",
    shotgun: "Shotgun",
    rocketlauncher: "Rocket Launcher",
    missilelauncher: "Missile Launcher",
    knife: "Knife/Bayonet"
}

type SpeciesType = keyof typeof speciesOptions
type PrimaryWeaponType = keyof typeof primaryWeaponOptions
type CamoType = keyof typeof camoOptions
type SecondaryWeaponType = keyof typeof secondaryWeaponOptions

export type InfantryRateInput = {
    species: SpeciesType,
    training_time: number,
    primary: PrimaryWeaponType,
    special_forces: boolean,
    chemical_adaptations: number,
    physical_adaptations: number,
    power_suit: boolean,
    armor: number,
    camoflauge: CamoType,
    shield: boolean,
    grenades: number,
    missiles: number,
    rockets: number,
    secondary: SecondaryWeaponType,
    name: string,
    other: number
}

const params: Params = {
    species: {id: "species", label: "Species of combatants", type: "select", options: speciesOptions, default: "human"},
    training_time: {id: "training_time", label: "Training time (months)", type: "number", num_type: "uint", default: 0},
    primary: {id: "primary", label: "Primary weapon", type: "select", options: primaryWeaponOptions, default: "assaultrifle"},
    special_forces: {id: "special_forces", label: "Special forces", type: "bool", default: false},
    chemical_adaptations: {id: "chemical_adaptations", label: "Chemical adaptations", type: "number", num_type: "uint", default: 0},
    physical_adaptations: {id: "physical_adaptations", label: "Physical adaptations", type: "number", num_type: "uint", default: 0},
    power_suit: {id: "power_suit", label: "Power suit", type: "bool", default: false},
    armor: {id: "armor", label: "Armor rating (0-10)", type: "number", num_type: "uint", range: {min: 0, max: 10}, default: 0},
    camoflauge: {id: "camoflauge", label: "Camouflage", type: "select", options: camoOptions, default: "none"},
    shield: {id: "shield", label: "Shielding device", type: "bool", default: false},
    grenades: {id: "grenades", label: "Grenades", type: "number", num_type: "uint", default: 0},
    missiles: {id: "missiles", label: "Missiles", type: "number", num_type: "uint", default: 0},
    rockets: {id: "rockets", label: "Rockets", type: "number", num_type: "uint", default: 0},
    secondary: {id: "secondary", label: "Secondary weapon", type: "select", options: secondaryWeaponOptions, default: "none"},
    other: {id: "other", label: "Other costs", type: "number", num_type: "uint", default: 0}
}

const rate = (values: InfantryRateInput): InfantryCost => {
    const {species, training_time, special_forces, chemical_adaptations, physical_adaptations, 
        power_suit, armor, camoflauge, shield, grenades, missiles, rockets, primary, 
        secondary, other} = values;

    const bodyCost = (species === "human") ? 10 : 100;
    const trainCost = training_time * 0;  // Training cost equals zero
    const specialCost = special_forces ? 1.1 : 1.0;  // Special forces 10% more expensive
    const chemicalCost = chemical_adaptations * 15;
    const physicalCost = physical_adaptations * 25;
    const powersuitCost = power_suit ? 50 : 0;
    const armorCost = armor + 1;
    const camoCost = 
        (camoflauge === "active") ? 25 :
        (camoflauge === "semiactive") ? 1 :
        (camoflauge === "regular") ? 0.1 : 0;
    const shieldCost = shield ? 5 : 0;
    
    // Armament
    const grenadeCost = grenades * 0.05;
    const missileCost = missiles * 5;
    const rocketCost = rockets * 1;
    const primaryCost =
        (primary === "assaultrifle") ? 1 :
        (primary === "machinegun") ? 50 :
        (primary === "sniperrifle") ? 1 :
        (primary === "sword") ? 15 :
        (primary === "staff") ? 30 : 0;
    const secondaryCost =
        (secondary === "pistol") ? 0.5 :
        (secondary === "shotgun") ? 0.675 :
        (secondary === "rocketlauncher") ? 15 :
        (secondary === "missilelauncher") ? 125 :
        (secondary === "knife") ? 0.05 : 0;
    const otherCost = other;

    const totalCost = (bodyCost + trainCost + chemicalCost + physicalCost + powersuitCost + armorCost + shieldCost + armorCost + camoCost + grenadeCost + rocketCost + missileCost + primaryCost + secondaryCost + otherCost) * specialCost;

    return {
        time: training_time,
        er: Math.ceil(totalCost * 1000)  // Convert to appropriate scale
    };
}

export default {
    rate: rate,
    params: params
}