import { useState } from "react";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Economy from "./components/Economy";
import Shipyards from "./components/Shipyards";
import ArmedForces from "./components/ArmedForces";
import HeaderMenu from "./components/HeaderMenu";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [nationId, setNationId] = useState("");
  const [userSettings, setUserSettings] = useState({
    treatment: "Commander",
    nationName: "",
    themeColor: "#646cff",
  });

  const handleEnter = (id) => {
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

  const handleBackToHome = () => {
    setCurrentView("home");
    setNationId("");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  if (currentView === "home") {
    return <HomePage onEnter={handleEnter} />;
  }

  if (currentView === "dashboard") {
    return (
      <Dashboard
        nationId={nationId}
        userSettings={userSettings}
        onNavigation={handleNavigation}
        onSettings={handleSettings}
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
      />
    );
  }

  if (currentView === "shipyards") {
    return (
      <Shipyards
        onBack={handleBackToDashboard}
        nationName={userSettings.nationName || nationId}
        themeColor={userSettings.themeColor}
      />
    );
  }

  if (currentView === "armed-forces") {
    return (
      <ArmedForces
        onBack={handleBackToDashboard}
        nationName={userSettings.nationName || nationId}
      />
    );
  }

  return null;
}

export default App;
