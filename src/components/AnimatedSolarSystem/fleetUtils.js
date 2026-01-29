export function getFleetsAtWorld(systemData, worldName) {
  if (!systemData) return [];
  return Object.entries(systemData).reduce((acc, [factionName, fleets]) => {
    fleets.forEach((fleet) => {
      if (fleet.State?.Location === worldName) acc.push({ ...fleet, factionName });
    });
    return acc;
  }, []);
}

export function groupFleetsByFaction(fleets) {
  return fleets.reduce((acc, fleet) => {
    const factionName = fleet.factionName;
    if (!acc[factionName]) acc[factionName] = [];
    acc[factionName].push(fleet);
    return acc;
  }, {});
}
