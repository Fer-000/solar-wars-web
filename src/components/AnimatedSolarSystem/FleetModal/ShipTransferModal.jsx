import React, { useState } from "react";

export default function ShipTransferModal({
  sourceFleet,
  allFleetsAtLocation,
  allVehicles,
  onTransfer,
  onClose,
  getFactionColor,
}) {
  const [step, setStep] = useState(1); // 1: Select fleet, 2: Select ships
  const [targetFleetId, setTargetFleetId] = useState(null);
  const [transferAmounts, setTransferAmounts] = useState({});

  // Filter to only show fleets from the same faction as source fleet
  const availableTargets = allFleetsAtLocation.filter(
    (fleet) =>
      fleet.ID !== sourceFleet.ID &&
      fleet.factionName.toLowerCase() === sourceFleet.factionName.toLowerCase()
  );

  const targetFleet = availableTargets.find((f) => f.ID === targetFleetId);

  const handleAmountChange = (vehicleId, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const sourceVehicle = sourceFleet.Vehicles?.find((v) => v.ID === vehicleId);

    // Cap at available count
    const cappedValue = sourceVehicle
      ? Math.min(numValue, sourceVehicle.count)
      : 0;

    setTransferAmounts((prev) => ({
      ...prev,
      [vehicleId]: cappedValue,
    }));
  };

  const handleSelectFleet = (fleetId) => {
    setTargetFleetId(fleetId);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setTransferAmounts({});
  };

  const handleTransfer = () => {
    if (!targetFleetId || Object.keys(transferAmounts).length === 0) return;

    // Validate amounts
    const validTransfers = {};
    let hasValidTransfer = false;

    Object.entries(transferAmounts).forEach(([vehicleId, amount]) => {
      if (amount > 0) {
        const sourceVehicle = sourceFleet.Vehicles?.find(
          (v) => v.ID === vehicleId
        );
        if (sourceVehicle && amount <= sourceVehicle.count) {
          validTransfers[vehicleId] = amount;
          hasValidTransfer = true;
        }
      }
    });

    if (hasValidTransfer) {
      onTransfer(targetFleetId, validTransfers);
      setTransferAmounts({});
      setTargetFleetId(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(12, 12, 14, 0.98)",
          border: "1px solid rgba(0, 245, 255, 0.4)",
          boxShadow: "0 0 40px rgba(0, 245, 255, 0.2)",
          borderRadius: "12px",
          width: "800px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 25px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#00f5ff",
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Transfer Ships {step === 2 && `- Step 2 of 2`}
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#888", fontSize: "0.9rem" }}>
            From: <span style={{ color: "#fff" }}>{sourceFleet.Name}</span>
            {step === 2 && targetFleet && (
              <>
                {" → "}
                <span style={{ color: "#fff" }}>{targetFleet.Name}</span>
              </>
            )}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 25px" }}>
          {/* Step 1: Target Fleet Selection */}
          {step === 1 && (
            <div>
              <label
                style={{
                  display: "block",
                  color: "#888",
                  fontSize: "0.9rem",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                }}
              >
                Select Target Fleet (Your Faction Only)
              </label>
              {availableTargets.length === 0 ? (
                <p style={{ color: "#666", fontStyle: "italic" }}>
                  No other fleets from your faction at this location
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {availableTargets.map((fleet) => (
                    <button
                      key={fleet.ID}
                      onClick={() => handleSelectFleet(fleet.ID)}
                      style={{
                        padding: "12px 15px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        color: "#fff",
                        fontSize: "1rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 245, 255, 0.1)";
                        e.currentTarget.style.border =
                          "1px solid rgba(0, 245, 255, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.border =
                          "1px solid rgba(255, 255, 255, 0.1)";
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>{fleet.Name}</div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#888",
                          marginTop: "4px",
                        }}
                      >
                        {fleet.Type || "Fleet"} •{" "}
                        {fleet.Vehicles?.reduce(
                          (sum, v) => sum + (v.count || 0),
                          0
                        ) || 0}{" "}
                        ships
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Ship Selection */}
          {step === 2 &&
            sourceFleet.Vehicles &&
            sourceFleet.Vehicles.length > 0 && (
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#888",
                    fontSize: "0.9rem",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  Select Ships to Transfer
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {sourceFleet.Vehicles.map((vehicle) => {
                    const vehicleData = allVehicles?.find(
                      (v) => v.ID === vehicle.ID
                    );
                    const transferAmount = transferAmounts[vehicle.ID] || 0;
                    console.log("Rendering vehicle:", vehicle, vehicleData);
                    return (
                      <div
                        key={vehicle.ID}
                        style={{
                          padding: "12px",
                          background: "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#fff", fontWeight: "500" }}>
                            {vehicleData?.name || `Unknown Ship`}
                          </div>
                          <div
                            style={{
                              color: "#666",
                              fontSize: "0.85rem",
                              marginTop: "4px",
                            }}
                          >
                            Available: {vehicle.count}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            max={vehicle.count}
                            value={transferAmount}
                            onChange={(e) =>
                              handleAmountChange(vehicle.ID, e.target.value)
                            }
                            style={{
                              width: "80px",
                              padding: "8px",
                              background: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(0, 245, 255, 0.3)",
                              borderRadius: "4px",
                              color: "#fff",
                              fontSize: "1rem",
                              textAlign: "center",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleAmountChange(
                                  vehicle.ID,
                                  Math.floor(vehicle.count / 2)
                                )
                              }
                              style={{
                                padding: "4px 8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "4px",
                                color: "#888",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              Half
                            </button>
                            <button
                              onClick={() =>
                                handleAmountChange(vehicle.ID, vehicle.count)
                              }
                              style={{
                                padding: "4px 8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "4px",
                                color: "#888",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              All
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "15px 25px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            justifyContent: step === 1 ? "flex-end" : "space-between",
            gap: "10px",
          }}
        >
          {step === 2 && (
            <button
              onClick={handleBack}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ← Back
            </button>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={handleTransfer}
                disabled={
                  !targetFleetId ||
                  Object.values(transferAmounts).every((v) => v === 0)
                }
                style={{
                  padding: "10px 30px",
                  background:
                    !targetFleetId ||
                    Object.values(transferAmounts).every((v) => v === 0)
                      ? "rgba(100, 100, 100, 0.2)"
                      : "rgba(0, 245, 255, 0.2)",
                  border:
                    !targetFleetId ||
                    Object.values(transferAmounts).every((v) => v === 0)
                      ? "1px solid rgba(100, 100, 100, 0.4)"
                      : "1px solid rgba(0, 245, 255, 0.6)",
                  borderRadius: "6px",
                  color:
                    !targetFleetId ||
                    Object.values(transferAmounts).every((v) => v === 0)
                      ? "#666"
                      : "#00f5ff",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor:
                    !targetFleetId ||
                    Object.values(transferAmounts).every((v) => v === 0)
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                }}
              >
                Transfer Ships
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
