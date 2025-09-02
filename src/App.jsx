import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Economy from "./components/Economy";
import Shipyards from "./components/Shipyards";
import ArmedForces from "./components/ArmedForces";
import TacticalMap from "./components/TacticalMap";
import HeaderMenu from "./components/HeaderMenu";
import databaseService from "./services/database";
import globalDB from "./services/GlobalDB";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [nationId, setNationId] = useState("");
  const [userSettings, setUserSettings] = useState({
    treatment: "Commander",
    nationName: "",
    themeColor: "#646cff",
  });
  const [dbLoaded, setDbLoaded] = useState(globalDB.isLoaded());
  const [loadingDb, setLoadingDb] = useState(false);
  const [refereeMode, setRefereeMode] = useState({
    isReferee: false,
    nations: [],
    worlds: [],
  });

  // Check if DB is already cached on app load
  useEffect(() => {
    if (globalDB.isLoaded()) {
      setDbLoaded(true);
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

    setCurrentView("dashboard");

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

  const handleSettingsChange = (newSettings) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleBackToHome = async () => {
    setCurrentView("home");
    setNationId("");
    setRefereeMode({ isReferee: false, nations: [], worlds: [] });
    // Optionally refresh cache when returning to homepage
    await fetchAndCacheDB();
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleTacticalMapClose = () => {
    if (refereeMode.isReferee) {
      // For referee, go back to homepage
      handleBackToHome();
    } else {
      // For normal users, go back to dashboard
      handleBackToDashboard();
    }
  };

  if (currentView === "home") {
    return (
      <HomePage
        onEnter={handleEnter}
        loadingDb={loadingDb}
        dbLoaded={dbLoaded}
      />
    );
  }

  if (currentView === "tactical-map") {
    return (
      <TacticalMap
        onClose={handleTacticalMapClose}
        currentFaction={nationId}
        dbLoaded={dbLoaded}
        refereeMode={refereeMode}
      />
    );
  }

  if (currentView === "dashboard") {
    return (
      <Dashboard
        nationId={nationId}
        userSettings={userSettings}
        onNavigation={handleNavigation}
        onSettings={handleSettings}
        dbLoaded={dbLoaded}
      />
    );
  }

  if (currentView === "settings") {
    return (
      <Settings
        onBack={handleBackToDashboard}
        userSettings={userSettings}
        onSettingsChange={handleSettingsChange}
      />
    );
  }

  if (currentView === "economy") {
    return (
      <Economy
        onBack={handleBackToDashboard}
        nationName={userSettings.nationName || nationId}
        dbLoaded={dbLoaded}
      />
    );
  }

  if (currentView === "shipyards") {
    return (
      <Shipyards
        onBack={handleBackToDashboard}
        nationName={userSettings.nationName || nationId}
        themeColor={userSettings.themeColor}
        dbLoaded={dbLoaded}
      />
    );
  }

  if (currentView === "armed-forces") {
    return (
      <ArmedForces
        onBack={handleBackToDashboard}
        nationName={nationId}
        dbLoaded={dbLoaded}
      />
    );
  }

  return null;
}

export default App;
