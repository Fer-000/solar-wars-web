import { objectReduce, objectMap } from './functions';

export const addResources = (resourcesA, resourcesB) => 
    objectMap({...resourcesA, ...resourcesB}, 
        (_, name) => (resourcesA[name] ?? 0) + (resourcesB[name] ?? 0)
    );

export const subResources = (resourcesA, resourcesB) => 
    objectMap({...resourcesA, ...resourcesB}, 
        (_, name) => (resourcesA[name] ?? 0) - (resourcesB[name] ?? 0)
    );

export const mulResources = (resourcesA, resourcesB) => 
    objectMap({...resourcesA, ...resourcesB}, 
        (_, name) => (resourcesA[name] ?? 0) * (resourcesB[name] ?? 1)
    );

export const divResources = (resourcesA, resourcesB) => 
    objectMap({...resourcesA, ...resourcesB}, 
        (_, name) => (resourcesA[name] ?? 0) / (resourcesB[name] ?? 1)
    );

export const scaleResources = (resourcesA, scale) => 
    objectMap(resourcesA, 
        (resource) => resource*scale
    );

export const roundResources = (resources) => objectMap(resources, (a) => Math.round(a));

export const minResources = (resourcesA, resourcesB = {}) => 
    objectMap(resourcesA, 
        (resource, name) => Math.min(resource, (resourcesB[name] ?? Infinity))
    );

export const maxResources = (resourcesA, resourcesB = {}) => 
    objectMap(resourcesA, 
        (resource, name) => Math.max(resource, (resourcesB[name] ?? 0))
    );

export const equResources = (resourcesA, resourcesB = {}) => 
    Object.keys(resourcesA).every((key) => resourcesA[key] === (resourcesB[key] ?? NaN)) && 
    Object.keys(resourcesB).every((key) => resourcesB[key] === (resourcesA[key] ?? NaN));

export const isEmpty = (resources) => objectReduce(resources, (acc, num) => acc && num === 0, true);

export const validResources = (resources) => objectReduce(resources, (acc, num) => acc && num >= 0, true)

export const economicCountBuildings = (buildings) => 
    buildings.Buildings.reduce((acc, count, level) => acc + (level + 1)*count, 0);
export const countBuildings = (buildings) => 
    buildings.Buildings.reduce((acc, count) => acc + count , 0)

const increaseRate = 0.02;

const sumCN = (c, n) => n*(n+2*c-1)/2;

export const buildingScale = (count, amount) => {
    const countPrime = Math.max(count - 26, 0);
    const amountPrime = Math.max(amount - 26 + (count - countPrime),0);
    const newBuildingCount = sumCN(countPrime, amountPrime)

    return amount+increaseRate*newBuildingCount;
}

export const buildingCost = (factionData, cost, amount = 1) => {
    const buildingCount = objectReduce(factionData.Buildings, (acc, list) => {
        return list.reduce((acc, builds) => acc + countBuildings(builds), acc)
    }, 0);
    
    const scale = buildingScale(buildingCount, amount);

    return roundResources(scaleResources(cost, scale));
}