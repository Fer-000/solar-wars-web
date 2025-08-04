import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Economy from "./components/Economy";
import Shipyards from "./components/Shipyards";
import ArmedForces from "./components/ArmedForces";
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

  const handleEnter = async (id) => {
    // Only fetch if not already cached
    if (!globalDB.isLoaded()) {
      await fetchAndCacheDB();
    }
    setNationId(id);
    setUserSettings((prev) => ({ ...prev, nationName: prev.nationName || id }));
    setCurrentView("dashboard");
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
    // Optionally refresh cache when returning to homepage
    await fetchAndCacheDB();
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
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
        nationName={userSettings.nationName || nationId}
        dbLoaded={dbLoaded}
      />
    );
  }

  return null;
}

export default App;
