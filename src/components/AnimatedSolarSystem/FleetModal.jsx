import React, { useState, useEffect } from "react";
import FleetModalHeader from "./FleetModal/FleetModalHeader";
import FleetSideBar from "./FleetModal/FleetSideBar";
import FleetModalManifest from "./FleetModal/FleetManifest";
import LocationSelectionModal from "./FleetModal/LocationSelectionModal";
import ShipTransferModal from "./FleetModal/ShipTransferModal";
import databaseService from "../../services/database";

export default function FleetModal({
  show,
  selectedFleet,
  onClose,
  getFactionColor,
  allFactions,
  systemData,
  currentFaction,
  refereeMode,
  toggleFactionCollapse,
}) {
  if (!show || !selectedFleet) return null;

  const [operationalMode, setOperationalMode] = useState(
    selectedFleet?.State?.Action || "Idle"
  );
  const [editMode, setEditMode] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update operational mode when fleet changes
  useEffect(() => {
    if (selectedFleet) {
      setOperationalMode(selectedFleet.State?.Action || "Idle");
    }
  }, [selectedFleet?.ID]);

  const isOwnFleet =
    selectedFleet.factionName.toLowerCase() === currentFaction.toLowerCase();

  // Save operational mode to database
  const handleSaveOperationalMode = async (newMode) => {
    if (!isOwnFleet) return;

    try {
      setIsSaving(true);
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        currentFaction
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedFleet.ID);

      if (fleetIndex !== -1) {
        fleets[fleetIndex].State = {
          ...fleets[fleetIndex].State,
          Action: newMode,
        };

        await databaseService.updateFleets(
          "The Solar Wars",
          currentFaction,
          fleets
        );

        // Update local state
        setOperationalMode(newMode);
        console.log(`Fleet ${selectedFleet.Name} action updated to ${newMode}`);
      }
    } catch (error) {
      console.error("Failed to save operational mode:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle location change
  const handleLocationChange = async (newLocation) => {
    if (!isOwnFleet) return;

    try {
      setIsSaving(true);
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        currentFaction
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedFleet.ID);

      if (fleetIndex !== -1) {
        fleets[fleetIndex].State = {
          ...fleets[fleetIndex].State,
          Location: newLocation,
        };

        await databaseService.updateFleets(
          "The Solar Wars",
          currentFaction,
          fleets
        );

        // Don't change operational mode when changing location
        setShowLocationModal(false);
        console.log(`Fleet ${selectedFleet.Name} moving to ${newLocation}`);

        // Close modal to refresh
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error("Failed to change location:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle ship transfer
  const handleShipTransfer = async (targetFleetId, transferAmounts) => {
    if (!isOwnFleet) return;

    try {
      setIsSaving(true);
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        currentFaction
      );
      const sourceIndex = fleets.findIndex((f) => f.ID === selectedFleet.ID);
      const targetIndex = fleets.findIndex((f) => f.ID === targetFleetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        console.error("Fleet not found");
        return;
      }

      const factionVehicles = allFactions[currentFaction]?.Vehicles || [];

      // Process transfers
      Object.entries(transferAmounts).forEach(([vehicleId, amount]) => {
        if (amount <= 0) return;

        // Find vehicle in source fleet
        const sourceVehicleIndex = fleets[sourceIndex].Vehicles.findIndex(
          (v) => v.ID === vehicleId
        );
        if (sourceVehicleIndex === -1) return;

        const sourceVehicle = fleets[sourceIndex].Vehicles[sourceVehicleIndex];
        if (sourceVehicle.count < amount) return;

        // Get vehicle data for value calculation
        const vehicleData = factionVehicles.find((v) => v.ID === vehicleId);
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
          (v) => v.ID === vehicleId
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

      await databaseService.updateFleets(
        "The Solar Wars",
        currentFaction,
        fleets
      );

      setShowTransferModal(false);
      console.log("Ships transferred successfully");

      // Close and reopen modal to refresh
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error("Failed to transfer ships:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get all fleets at the same location for ship transfer
  const fleetsAtLocation = Object.entries(systemData || {}).reduce(
    (acc, [factionName, fleets]) => {
      const locationFleets = fleets.filter(
        (f) => f.State?.Location === selectedFleet.State?.Location
      );
      locationFleets.forEach((fleet) => {
        acc.push({ ...fleet, factionName });
      });
      return acc;
    },
    []
  );

  const totalShips = Array.isArray(selectedFleet.Vehicles)
    ? selectedFleet.Vehicles.reduce((sum, v) => sum + (v.count || 0), 0)
    : 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => onClose && onClose()}
    >
      <div
        style={{
          background: "rgba(12, 12, 14, 0.95)",
          border: `1px solid ${getFactionColor(selectedFleet.factionName)}`,
          boxShadow: `0 0 40px ${getFactionColor(selectedFleet.factionName)}40`,
          borderRadius: "12px",
          width: "900px",
          maxWidth: "95vw",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <FleetModalHeader
          selectedFleet={selectedFleet}
          allFactions={allFactions}
          getFactionColor={getFactionColor}
          onClose={onClose}
        />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <FleetSideBar
            selectedFleet={selectedFleet}
            currentFaction={currentFaction}
            toggleFactionCollapse={toggleFactionCollapse}
            onClose={onClose}
            operationalMode={operationalMode}
            onOperationalModeChange={handleSaveOperationalMode}
            onLocationClick={() => setShowLocationModal(true)}
            editMode={editMode}
            setEditMode={setEditMode}
            onTransferShips={() => setShowTransferModal(true)}
            isSaving={isSaving}
          />

          <FleetModalManifest
            selectedFleet={selectedFleet}
            currentFaction={currentFaction}
            systemData={systemData}
            allFactions={allFactions}
            refereeMode={refereeMode}
            totalShips={totalShips}
          />
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <LocationSelectionModal
          currentLocation={selectedFleet.State?.Location || "Deep Space"}
          onSelectLocation={handleLocationChange}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {/* Ship Transfer Modal */}
      {showTransferModal && (
        <ShipTransferModal
          sourceFleet={selectedFleet}
          allFleetsAtLocation={fleetsAtLocation}
          allFactions={allFactions}
          onTransfer={handleShipTransfer}
          onClose={() => setShowTransferModal(false)}
          getFactionColor={getFactionColor}
        />
      )}
    </div>
  );
}
