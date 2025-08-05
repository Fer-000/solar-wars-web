import React, { useEffect, useState } from "react";
import databaseService from "../services/database";

// TradePanel: shows basic trade info for the faction
const TradePanel = ({ nationName }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all factions
        const allFactions = await databaseService.getFactions("The Solar Wars");
        const factionEntry = Object.entries(allFactions).find(
          ([key, value]) =>
            value?.name?.toLowerCase() === nationName.toLowerCase()
        );
        const factionId = factionEntry ? factionEntry[0] : null;
        if (!factionId) throw new Error("Faction not found");
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          factionId
        );
        // Get trades
        const tradeList =
          factionData.trades && Array.isArray(factionData.trades)
            ? factionData.trades
            : [];
        setTrades(tradeList);
      } catch (err) {
        setError("Failed to load trades: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [nationName]);

  if (loading) return <div>Loading trade info...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <strong>Active Trades:</strong>
      {trades.length === 0 ? (
        <div>No active trades.</div>
      ) : (
        <ul>
          {trades.map((trade, idx) => (
            <li key={idx}>{trade}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TradePanel;
