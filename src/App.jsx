import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import Settings from "./components/Settings";
import Shipyards from "./components/Shipyards";
import ArmedForces from "./components/ArmedForces";
import AnimatedSolarSystem from "./components/AnimatedSolarSystem";
import SystemSelection from "./components/SystemSelection";
import LegalModal from "./components/LegalModal";
import databaseService from "./services/database";
import globalDB from "./services/GlobalDB";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [nationId, setNationId] = useState("");
  const [selectedSystem, setSelectedSystem] = useState(null);
  // Start with modal visible, hide it if cookie exists
  const [showLegalModal, setShowLegalModal] = useState(true);
  const [userSettings, setUserSettings] = useState({
    treatment: "Commander",
    nationName: "",
    themeColor: "#646cff",
    animationLevel: "total",
  });
  const [dbLoaded, setDbLoaded] = useState(globalDB.isLoaded());
  const [loadingDb, setLoadingDb] = useState(false);
  const [refereeMode, setRefereeMode] = useState({
    isReferee: false,
    nations: [],
    worlds: [],
  });
  const [systemData, setSystemData] = useState({});
  const [allFactions, setAllFactions] = useState({});

  // Check if DB is already cached on app load
  useEffect(() => {
    if (globalDB.isLoaded()) {
      setDbLoaded(true);
    }

    // Check for legal acceptance cookie
    const cookies = document.cookie.split(";");
    const legalAccepted = cookies.some((cookie) =>
      cookie.trim().startsWith("solar_wars_legal_accepted=true"),
    );

    // Hide modal if cookie exists
    if (legalAccepted) {
      setShowLegalModal(false);
    }
  }, []);

  const fetchAndCacheDB = async () => {
    setLoadingDb(true);
    try {
      // Fetch entire DB and cache it
      const allServers = await databaseService.listCollections();
      const dbData = {};
      for (const server of allServers) {
        dbData[server] = await databaseService.getFactions(server);
      }
      globalDB.set(dbData);
      setDbLoaded(true);
    } catch (error) {
      console.error("Error fetching database:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchUserSettings = async (factionId) => {
    try {
      // Try to get faction data from cache first
      let factionData = null;
      const cachedData = globalDB.get();

      if (cachedData && cachedData["The Solar Wars"]) {
        factionData = cachedData["The Solar Wars"][factionId.toLowerCase()];
      }

      if (factionData) {
        const newSettings = {
          treatment: factionData.leader || "Commander",
          nationName: factionData.name || factionId,
          themeColor: factionData.color || "#646cff",
          factionId: factionId,
        };

        setUserSettings(newSettings);
        return newSettings;
      } else {
        console.warn(`Faction ${factionId} not found in database`);
        // Keep default settings but set factionId
        setUserSettings((prev) => ({
          ...prev,
          factionId: factionId,
          nationName: factionId,
        }));
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      // Keep default settings but set factionId
      setUserSettings((prev) => ({
        ...prev,
        factionId: factionId,
        nationName: factionId,
      }));
    }
  };

  const handleEnter = async (faction, refereeData = null) => {
    if (faction === "referee") {
      // Set referee mode and open tactical map
      setRefereeMode({
        isReferee: true,
        nations: refereeData.nations,
        worlds: refereeData.worlds,
      });
      setNationId("referee");
      if (!dbLoaded) {
        await fetchAndCacheDB();
      }
      setCurrentView("tactical-map");

      return;
    }

    // Normal faction login
    setRefereeMode({ isReferee: false, nations: [], worlds: [] });
    setNationId(faction);

    setCurrentView("tactical-map"); // Changed from "dashboard" to go directly to map

    // Cache DB if not already loaded
    if (!dbLoaded) {
      await fetchAndCacheDB();
    }
    fetchUserSettings(faction);
  };

  const handleNavigation = (section) => {
    setCurrentView(section);
  };

  const handleSettings = () => {
    setCurrentView("settings");
  };

  const handleWiki = () => {
    var win = window.open(
      "https://fer-000.github.io/solar-wars-wiki",
      "_blank",
    );
    win.focus();
  };

  const handleSettingsChange = (newSettings) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleBackToHome = async () => {
    setCurrentView("animated-solar-system");
    setNationId("");
    setRefereeMode({ isReferee: false, nations: [], worlds: [] });
    // Optionally refresh cache when returning to homepage
    await fetchAndCacheDB();
  };

  const handleBackToTacticalMap = () => {
    setCurrentView("tactical-map");
  };

  const handleTacticalMapClose = () => {
    if (refereeMode.isReferee) {
      // For referee, go back to homepage
      handleBackToHome();
    } else {
      // For normal users, go back to system selection
      setSelectedSystem(null);
    }
  };

  // System data helpers
  const solarSystems = {
    Sol: [
      "Mercury",
      "Venus",
      "Earth",
      "Luna",
      "Mars",
      "Ceres",
      "Asteroid Belt Area A",
      "Asteroid Belt Area B",
      "Asteroid Belt Area C",
      "Jupiter",
      "Io",
      "Europa",
      "Ganymede",
      "Callisto",
      "Saturn",
      "Mimas",
      "Enceladus",
      "Tethys",
      "Dione",
      "Rhea",
      "Titan",
      "Iapetus",
      "Uranus",
      "Miranda",
      "Ariel",
      "Umbriel",
      "Titania",
      "Oberon",
      "Neptune",
      "Triton",
      "Proteus",
      "Nereid",
      "Pluto",
      "Charon",
    ],
    Corelli: [
      "Barcas",
      "Deo Gloria",
      "Novai",
      "Asteroid Belt Area 1",
      "Asteroid Belt Area 2",
      "Asteroid Belt Area 3",
      "Asteroid Belt Area 4",
      "Scipios",
    ],
  };

  const factionColors = {
    athena: "#00f5ff",
    europa: "#ff6b6b",
    ganymede: "#4caf50",
    callisto: "#ff9800",
    io: "#9c27b0",
    dione: "#ffeb3b",
    jupiter: "#795548",
  };

  const randomColorCache = {};
  const getRandomColor = (factionName) => {
    if (randomColorCache[factionName]) return randomColorCache[factionName];
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 65%)`;
    randomColorCache[factionName] = color;
    return color;
  };

  const getFactionColor = (factionName) => {
    if (!factionName) return "#888888";
    const faction = allFactions[factionName];
    if (faction && faction.color) return faction.color;
    if (factionName.toLowerCase() === nationId.toLowerCase())
      return factionColors[factionName.toLowerCase()] || "#00f5ff";
    return getRandomColor(factionName);
  };

  // Load all factions on mount
  useEffect(() => {
    loadAllFactionsData();
  }, []);

  const loadAllFactionsData = async () => {
    try {
      const factions = await databaseService.getFactions("The Solar Wars");
      setAllFactions(factions);
    } catch (error) {
      console.error("Error loading faction data:", error);
    }
  };

  // Load system data when system is selected
  useEffect(() => {
    if (selectedSystem && Object.keys(allFactions).length > 0) {
      loadSystemData(selectedSystem);
    }
  }, [selectedSystem, allFactions]);

  const loadSystemData = async (systemName) => {
    try {
      const systemFleets = {};
      const allWorlds = [...solarSystems.Sol, ...solarSystems.Corelli];

      for (const [factionName, factionData] of Object.entries(allFactions)) {
        if (factionData.Fleets) {
          let fleetsInSystem = factionData.Fleets.filter((fleet) =>
            allWorlds.includes(fleet.State?.Location),
          );

          if (refereeMode?.isReferee) {
            const { nations, worlds: refWorlds } = refereeMode;
            if (refWorlds.length > 0 && nations.length === 0) {
              fleetsInSystem = fleetsInSystem.filter((fleet) =>
                refWorlds.includes(fleet.State?.Location),
              );
            } else if (nations.length > 0 && refWorlds.length === 0) {
              if (!nations.includes(factionName.toLowerCase()))
                fleetsInSystem = [];
            } else if (nations.length > 0 && refWorlds.length > 0) {
              const isSpecifiedNation = nations.includes(
                factionName.toLowerCase(),
              );
              const fleetsOnSpecifiedWorlds = fleetsInSystem.filter((fleet) =>
                refWorlds.includes(fleet.State?.Location),
              );
              if (!isSpecifiedNation) fleetsInSystem = fleetsOnSpecifiedWorlds;
            }
          }

          if (fleetsInSystem.length > 0)
            systemFleets[factionName] = fleetsInSystem;
        }
      }
      setSystemData(systemFleets);
    } catch (error) {
      console.error("Error loading system data:", error);
    }
  };

  if (currentView === "home") {
    return (
      <>
        <HomePage
          onEnter={handleEnter}
          loadingDb={loadingDb}
          dbLoaded={dbLoaded}
        />
        {showLegalModal && (
          <LegalModal
            onAccept={() => setShowLegalModal(false)}
            onReject={() => setShowLegalModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === "tactical-map") {
    if (!dbLoaded) {
      return (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "#050505",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00f5ff",
              fontFamily: "monospace",
              fontSize: "1.5rem",
            }}
          >
            ESTABLISHING LINK...
          </div>
          {showLegalModal && (
            <LegalModal
              onAccept={() => setShowLegalModal(false)}
              onReject={() => setShowLegalModal(false)}
            />
          )}
        </>
      );
    }

    // Show system selection if no system is selected
    if (!selectedSystem) {
      return (
        <>
          <SystemSelection onSelectSystem={setSelectedSystem} />
          {showLegalModal && (
            <LegalModal
              onAccept={() => setShowLegalModal(false)}
              onReject={() => setShowLegalModal(false)}
            />
          )}
        </>
      );
    }

    // Show AnimatedSolarSystem for selected system
    return (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "#050505",
          }}
        >
          <AnimatedSolarSystem
            systemName={selectedSystem}
            onWorldClick={() => {}}
            fleetsAtWorld={Object.entries(systemData).reduce(
              (acc, [factionName, fleets]) => {
                fleets.forEach((fleet) => {
                  const location = fleet.State?.Location;
                  if (
                    location &&
                    solarSystems[selectedSystem].includes(location)
                  ) {
                    if (!acc[location]) acc[location] = [];
                    acc[location].push({ ...fleet, factionName });
                  }
                });
                return acc;
              },
              {},
            )}
            getFactionColor={getFactionColor}
            onClose={handleTacticalMapClose}
            refereeMode={refereeMode}
            onBackToSystems={() => setSelectedSystem(null)}
            onSettings={handleSettings}
            onShipyard={() => setCurrentView("shipyards")}
            onArmedForces={() => setCurrentView("armed-forces")}
            allFactions={allFactions}
            systemData={systemData}
            currentFaction={nationId}
            animationSettings={{
              level: userSettings.animationLevel || "total",
            }}
          />
        </div>
        {showLegalModal && (
          <LegalModal
            onAccept={() => setShowLegalModal(false)}
            onReject={() => setShowLegalModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === "settings") {
    return (
      <>
        <Settings
          onBack={handleBackToTacticalMap}
          userSettings={userSettings}
          onSettingsChange={handleSettingsChange}
        />
        {showLegalModal && (
          <LegalModal
            onAccept={() => setShowLegalModal(false)}
            onReject={() => setShowLegalModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === "shipyards") {
    return (
      <>
        <Shipyards
          onBack={handleBackToTacticalMap}
          nationName={userSettings.nationName || nationId}
          themeColor={userSettings.themeColor}
          dbLoaded={dbLoaded}
        />
        {showLegalModal && (
          <LegalModal
            onAccept={() => setShowLegalModal(false)}
            onReject={() => setShowLegalModal(false)}
          />
        )}
      </>
    );
  }

  if (currentView === "armed-forces") {
    return (
      <>
        <ArmedForces
          onBack={handleBackToTacticalMap}
          nationName={nationId}
          dbLoaded={dbLoaded}
        />
        {showLegalModal && (
          <LegalModal
            onAccept={() => setShowLegalModal(false)}
            onReject={() => setShowLegalModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {showLegalModal && (
        <LegalModal
          onAccept={() => setShowLegalModal(false)}
          onReject={() => setShowLegalModal(false)}
        />
      )}
    </>
  );
}

export default App;
