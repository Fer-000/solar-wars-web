import React from "react";
import StarField from "./StarField";
import { formatSolarDate } from "../utils/dateUtils";
import "./Dashboard.css";

// Icons with increased stroke width for better visibility
const Icons = {
  Economy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
      />
    </svg>
  ),
  Shipyards: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  ),
  ArmedForces: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 4l2.5 2.5-2 2-2.5-2.5m-5 11l2.5 2.5-2 2-2.5-2.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 4l-2.5 2.5 2 2 2.5-2.5m5 11l-2.5 2.5 2 2 2.5-2.5"
      />
    </svg>
  ),
  Wiki: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

const Dashboard = ({
  nationId,
  onNavigation,
  onWiki,
  onSettings,
  userSettings = {},
}) => {
  const { treatment = "Commander", nationName = nationId } = userSettings;

  const mainActions = [
    {
      id: "economy",
      title: "ECONOMY",
      description: "Manage Treasury & Trade",
      icon: <Icons.Economy />,
    },
    {
      id: "shipyards",
      title: "SHIPYARDS",
      description: "Vehicle Production",
      icon: <Icons.Shipyards />,
    },
    {
      id: "armed-forces",
      title: "ARMED FORCES",
      description: "Operations Command",
      icon: <Icons.ArmedForces />,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="grid-overlay"></div>
      <StarField density={80} />

      <div className="dashboard-content">
        <div className="top-bar">
          <div className="stardate-text">{formatSolarDate(new Date())}</div>
        </div>

        <div className="header-section">
          <h1>
            WELCOME, <span className="highlight-text">{treatment}</span>
          </h1>
        </div>
        <h2 className="nation-name">{nationName}</h2>
        <br />

        <div className="cards-container">
          {mainActions.map((action, index) => (
            <div
              key={action.id}
              className="tech-card-wrapper"
              onClick={() => onNavigation(action.id)}
            >
              {/* Corner markers for tech look */}
              <div className="corner-marker top-left"></div>
              <div className="corner-marker top-right"></div>
              <div className="corner-marker bottom-left"></div>
              <div className="corner-marker bottom-right"></div>

              <div className="tech-card-content">
                <div className="icon-glow">{action.icon}</div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bottom-dock">
          <button className="command-btn" onClick={onWiki}>
            <span className="btn-icon">
              <Icons.Wiki />
            </span>
            <span className="btn-label"></span>
          </button>

          <button className="command-btn" onClick={onSettings}>
            <span className="btn-icon">
              <Icons.Settings />
            </span>
            <span className="btn-label"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
