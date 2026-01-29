import React, { useState, useEffect } from "react";
import databaseService from "../services/database";

// --- Components ---
import NationStatusCard from "./ArmedForces/NationStatusCard";
import ActiveUnitsList from "./ArmedForces/ActiveUnitsList";
import AssetList from "./ArmedForces/AssetList";

// --- Fleet Modal Components ---
import FleetModalHeader from "./AnimatedSolarSystem/FleetModal/FleetModalHeader";
import FleetSideBar from "./AnimatedSolarSystem/FleetModal/FleetSideBar";
import FleetManifest from "./AnimatedSolarSystem/FleetModal/FleetManifest";
import LocationSelectionModal from "./AnimatedSolarSystem/FleetModal/LocationSelectionModal";
import ShipTransferModal from "./AnimatedSolarSystem/FleetModal/ShipTransferModal";

import VehicleDetailModal from "./ArmedForces/Modals/VehicleDetailModal";
import RenameFleetModal from "./ArmedForces/Modals/RenameFleetModal";

import "./CenterPage.css";
import "./ArmedForces.css";

const ArmedForces = ({ onBack, nationName, dbLoaded }) => {
  if (!dbLoaded) return <div className="loading-screen">INITIALIZING...</div>;

  // --- State ---
  const [units, setUnits] = useState([]);
  const [vehicleAssets, setVehicleAssets] = useState({});
  const [allVehicles, setAllVehicles] = useState([]);
  const [nationInfo, setNationInfo] = useState({
    name: nationName,
    territory: 0,
    population: 0,
  });
  const [totalHexes, setTotalHexes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [activeModal, setActiveModal] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedVehicleName, setSelectedVehicleName] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Helpers ---
  const getSelectedFleetObject = () => {
    if (!selectedUnit) return null;
    return {
      ID: selectedUnit.id,
      Name: selectedUnit.name,
      factionName: nationName,
      Type: selectedUnit.type,
      State: {
        Location: selectedUnit.location,
        Action: selectedUnit.status,
      },
      Vehicles: selectedUnit.vehicles || [],
    };
  };

  const getSystemData = () => {
    const myFleets = units.map((u) => ({
      ID: u.id,
      Name: u.name,
      factionName: nationName,
      State: { Location: u.location, Action: u.status },
      Vehicles: u.vehicles || [],
    }));
    return { [nationName]: myFleets };
  };

  // --- Load Data ---
  const loadData = async () => {
    try {
      setLoading(true);
      await databaseService.debugConnection();
      const data = await databaseService.getFactionInfo(
        "The Solar Wars",
        nationName,
      );

      if (data) {
        setNationInfo({
          name: data.name,
          territory: data.territory,
          population: data.population,
          controlledWorlds: data.controlledWorlds || 0,
        });

        const hexCount = Object.values(data.maps || {}).reduce(
          (sum, info) => sum + (typeof info === "object" ? info.Hexes : info),
          0,
        );
        setTotalHexes(hexCount);

        setUnits(
          databaseService.convertFleetsToUnits(data.fleets, data.vehicles),
        );
        setAllVehicles(data.vehicles);
        setVehicleAssets(
          databaseService.calculateVehicleTotalsFromFleets(
            data.fleets,
            data.vehicles,
          ),
        );
      } else {
        setError(`Nation "${nationName}" not found`);
      }
    } catch (err) {
      setError("Connection Failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [nationName]);

  // --- Handlers ---
  const handleCreateFleet = async () => {
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName,
      );
      const newFleet = {
        ID: Date.now(),
        Name: `Fleet ${fleets.length + 1}`,
        Type: "Space",
        Vehicles: [],
        Value: { CM: 0, CS: 0, EL: 0, ER: 0 },
        State: { Action: "Defense", Location: "Earth" },
        CSCost: 0,
      };
      await databaseService.updateFleets("The Solar Wars", nationName, [
        ...fleets,
        newFleet,
      ]);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAction = async (newAction) => {
    if (!selectedUnit) return;
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName,
      );
      const fleet = fleets.find((f) => f.ID === selectedUnit.id);
      if (fleet) {
        fleet.State.Action = newAction;
        await databaseService.updateFleets(
          "The Solar Wars",
          nationName,
          fleets,
        );
        setUnits((prev) =>
          prev.map((u) =>
            u.id === selectedUnit.id ? { ...u, status: newAction } : u,
          ),
        );
        setSelectedUnit((prev) => ({ ...prev, status: newAction }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveUnit = async (unitId, location) => {
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName,
      );
      const fleet = fleets.find((f) => f.ID === unitId);
      if (fleet) {
        fleet.State.Location = location;
        await databaseService.updateFleets(
          "The Solar Wars",
          nationName,
          fleets,
        );
        setUnits((prev) =>
          prev.map((u) => (u.id === unitId ? { ...u, location } : u)),
        );
        setSelectedUnit((prev) => ({ ...prev, location }));
        setActiveModal("CONTROL");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameUnit = async (name, type) => {
    if (!selectedUnit) return;
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName,
      );
      const fleet = fleets.find((f) => f.ID === selectedUnit.id);
      if (fleet) {
        fleet.Name = name;
        fleet.Type = type;
        await databaseService.updateFleets(
          "The Solar Wars",
          nationName,
          fleets,
        );
        loadData();
        setActiveModal("CONTROL");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShipTransfer = async (targetFleetId, transferAmounts) => {
    if (!selectedUnit) return;

    try {
      setIsSaving(true);
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName,
      );
      const sourceIndex = fleets.findIndex((f) => f.ID === selectedUnit.id);
      const targetIndex = fleets.findIndex((f) => f.ID === targetFleetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        console.error("Fleet not found");
        return;
      }

      // Process transfers
      Object.entries(transferAmounts).forEach(([vehicleId, amount]) => {
        if (amount <= 0) return;

        // Find vehicle in source fleet
        const sourceVehicleIndex = fleets[sourceIndex].Vehicles.findIndex(
          (v) => v.ID === vehicleId,
        );
        if (sourceVehicleIndex === -1) return;

        const sourceVehicle = fleets[sourceIndex].Vehicles[sourceVehicleIndex];
        if (sourceVehicle.count < amount) return;

        // Get vehicle data for value calculation
        const vehicleData = allVehicles.find((v) => v.ID === vehicleId);
        if (!vehicleData) return;

        const vehicleValue = vehicleData.Value || {
          CM: 0,
          EL: 0,
          CS: 0,
          ER: 0,
        };
        const vehicleCSCost = vehicleData.CSCost || 0;

        // Subtract from source
        sourceVehicle.count -= amount;
        fleets[sourceIndex].Value.CM -= vehicleValue.CM * amount;
        fleets[sourceIndex].Value.EL -= vehicleValue.EL * amount;
        fleets[sourceIndex].Value.CS -= vehicleValue.CS * amount;
        fleets[sourceIndex].Value.ER -= vehicleValue.ER * amount;
        fleets[sourceIndex].CSCost -= vehicleCSCost * amount;

        // Remove vehicle entry if count is 0
        if (sourceVehicle.count <= 0) {
          fleets[sourceIndex].Vehicles.splice(sourceVehicleIndex, 1);
        }

        // Add to target
        let targetVehicle = fleets[targetIndex].Vehicles.find(
          (v) => v.ID === vehicleId,
        );
        if (!targetVehicle) {
          targetVehicle = { ID: vehicleId, count: 0 };
          fleets[targetIndex].Vehicles.push(targetVehicle);
        }
        targetVehicle.count += amount;
        fleets[targetIndex].Value.CM += vehicleValue.CM * amount;
        fleets[targetIndex].Value.EL += vehicleValue.EL * amount;
        fleets[targetIndex].Value.CS += vehicleValue.CS * amount;
        fleets[targetIndex].Value.ER += vehicleValue.ER * amount;
        fleets[targetIndex].CSCost += vehicleCSCost * amount;
      });

      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      console.log("Ships transferred successfully");
      loadData(); // Refresh data
      setActiveModal("CONTROL"); // Return to control modal
    } catch (error) {
      console.error("Failed to transfer ships:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedFleetObject = getSelectedFleetObject();

  return (
    <div className="armed-forces">
      <div className="grid-background" />

      <div className="armed-forces-container">
        <div className="header-section">
          <button className="back-button" onClick={onBack}>
            &lt; RETURN
          </button>
        </div>

        <div className="center-subtitle">ARMED FORCES COMMAND</div>

        {error && <div className="error-banner">WARNING: {error}</div>}

        <div className="armed-forces-content">
          <div className="left-sidebar">
            <NationStatusCard
              info={nationInfo}
              hexes={totalHexes}
              loading={loading}
            />
          </div>

          <div className="center-grid">
            <ActiveUnitsList
              units={units}
              allVehicles={allVehicles}
              loading={loading}
              onSelect={(unit) => {
                setSelectedUnit(unit);
                setActiveModal("CONTROL");
              }}
              onCreate={handleCreateFleet}
            />
          </div>

          <div className="right-sidebar">
            <AssetList
              assets={vehicleAssets}
              onSelect={(name) => {
                setSelectedVehicleName(name);
                setActiveModal("VEHICLE");
              }}
            />
          </div>
        </div>

        {/* --- MODALS --- */}

        {/* 1. FLEET CONTROL MODAL */}
        {activeModal === "CONTROL" && selectedFleetObject && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            {/* UPDATED: Using 'fleet-control-modal' class for correct centering 
                   and dimensions. Removed inline styles.
                */}
            <div
              className="fleet-control-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <FleetModalHeader
                selectedFleet={selectedFleetObject}
                allFactions={{ [nationName]: { name: nationName } }}
                getFactionColor={() => "#00f5ff"}
                onClose={() => setActiveModal(null)}
              />

              {/* UPDATED: 'fleet-modal-body' ensures side-by-side layout 
                       wraps nicely inside the flex container 
                    */}
              <div className="fleet-modal-body">
                {/* Note: We are passing scrollable-content class implicitly 
                           via CSS targeting inside FleetSideBar/FleetManifest if needed, 
                           or you can add classNames if the components support it.
                           Assuming FleetSideBar handles its own layout, the flex:1 here helps.
                        */}
                <FleetSideBar
                  selectedFleet={selectedFleetObject}
                  currentFaction={nationName}
                  onClose={() => setActiveModal(null)}
                  operationalMode={selectedFleetObject.State.Action}
                  onOperationalModeChange={handleUpdateAction}
                  onLocationClick={() => setActiveModal("MOVE")}
                  onTransferShips={() => setActiveModal("TRANSFER")}
                  editMode={false}
                  setEditMode={() => setActiveModal("EDIT")}
                  isSaving={false}
                  toggleFactionCollapse={() => {}}
                />

                <FleetManifest
                  selectedFleet={selectedFleetObject}
                  currentFaction={nationName}
                  systemData={getSystemData()}
                  allFactions={{ [nationName]: { Vehicles: allVehicles } }}
                  totalShips={selectedFleetObject.Vehicles.reduce(
                    (a, b) => a + (b.count || 0),
                    0,
                  )}
                  refereeMode={{ isReferee: true }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SUB MODALS (Move, Edit, Transfer) */}

        {activeModal === "MOVE" && selectedUnit && (
          <LocationSelectionModal
            currentLocation={selectedUnit.location}
            onSelectLocation={(world) => handleMoveUnit(selectedUnit.id, world)}
            onClose={() => setActiveModal("CONTROL")}
          />
        )}

        {activeModal === "EDIT" && selectedUnit && (
          <RenameFleetModal
            unit={selectedUnit}
            onClose={() => setActiveModal("CONTROL")}
            onSave={handleRenameUnit}
          />
        )}

        {activeModal === "TRANSFER" && selectedUnit && (
          <ShipTransferModal
            sourceFleet={{
              ...selectedUnit,
              Vehicles: selectedUnit.vehicles || [],
              Name: selectedUnit.name,
              ID: selectedUnit.id,
              factionName: nationName,
            }}
            allFleetsAtLocation={units
              .map((u) => ({
                ...u,
                ID: u.id,
                Name: u.name,
                Vehicles: u.vehicles,
                factionName: nationName,
              }))
              .filter((u) => u.location === selectedUnit.location)}
            allVehicles={allVehicles}
            getFactionColor={() => "#00f5ff"}
            onTransfer={handleShipTransfer}
            onClose={() => setActiveModal("CONTROL")}
          />
        )}

        {/* 3. VEHICLE DETAILS */}
        {activeModal === "VEHICLE" && selectedVehicleName && (
          <VehicleDetailModal
            vehicleName={selectedVehicleName}
            allVehicles={allVehicles}
            onClose={() => setActiveModal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ArmedForces;
