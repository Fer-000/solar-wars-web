import React from "react";

// --- CSS Styles ---
const styles = `
  /* --- Keyframes --- */
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spinReverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  /* --- Global Reset --- */
  * { box-sizing: border-box; }

  /* --- Main Container --- */
  .system-selection-container {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* Mobile viewport fix */
    background: radial-gradient(circle at center, #0b0d12 0%, #000000 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    -webkit-overflow-scrolling: touch;
  }

  /* Center content wrapper */
  .system-selection-content-wrapper {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px;
  }

  .grid-background {
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px), 
      linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  /* --- Typography --- */
  .title-container {
    text-align: center;
    z-index: 2;
    margin-bottom: 50px;
    margin-top: 40px;
  }

  .main-title {
    color: #fff;
    font-size: 3rem;
    font-family: monospace;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 10px;
    margin: 0;
    text-shadow: 0 0 20px rgba(255,255,255,0.2);
    display: inline-block;
    position: relative;
  }
  
  .main-title::before, .main-title::after {
    content: "";
    position: absolute;
    bottom: -15px;
    height: 1px;
    background: rgba(0, 245, 255, 0.5);
  }
  .main-title::before { left: 0; width: 30%; }
  .main-title::after { right: 0; width: 30%; }
  
  .subtitle {
    color: rgba(0, 245, 255, 0.5);
    font-family: monospace;
    margin-top: 25px;
    letter-spacing: 4px;
    font-size: 0.8rem;
  }

  /* --- Cards Layout --- */
  .cards-wrapper {
    display: flex;
    gap: 40px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap; 
    z-index: 2;
    width: 100%;
    padding-bottom: 60px;
  }

  /* --- Card Component --- */
  .system-card {
    position: relative;
    width: 260px;
    height: 320px;
    background: rgba(10, 12, 16, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(8px);
    overflow: hidden;
    -webkit-tap-highlight-color: transparent; 
  }

  /* Hover Effects (Desktop) */
  @media (hover: hover) {
    .system-card:hover {
      transform: translateY(-10px);
      border-color: var(--card-color);
      box-shadow: 0 20px 50px -10px var(--card-glow);
      background: rgba(10, 12, 16, 0.8);
    }
    .system-card:hover .card-icon {
      transform: scale(1.1);
      filter: drop-shadow(0 0 20px var(--card-glow));
    }
    .system-card:hover .card-name {
      letter-spacing: 6px;
    }
  }

  /* Active Effects (Mobile) */
  .system-card:active {
    transform: scale(0.96);
    border-color: var(--card-color);
    background: rgba(10, 12, 16, 0.9);
  }

  .card-icon {
    transition: all 0.5s ease;
    z-index: 3;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .card-name {
    color: #fff;
    font-size: 1.6rem;
    font-family: monospace;
    font-weight: bold;
    letter-spacing: 3px;
    text-transform: uppercase;
    z-index: 3;
    transition: letter-spacing 0.3s ease;
  }
  
  /* --- Mobile Optimization --- */
  @media (max-width: 768px) {
    .main-title { font-size: 2rem; letter-spacing: 6px; }
    .cards-wrapper { flex-direction: column; gap: 20px; }
    
    .system-card {
      width: 100%;
      max-width: 340px;
      height: 120px; /* Compact horizontal card */
      flex-direction: row;
      padding: 0 30px;
      justify-content: flex-start;
      gap: 30px;
    }
    
    .card-icon { margin-bottom: 0; transform: scale(0.7); }
    .card-name { font-size: 1.4rem; }
  }
`;

// --- NEW HIGH-FIDELITY SVG ICONS ---

const SolIcon = ({ color }) => (
  <svg width="120" height="120" viewBox="0 0 100 100">
    <defs>
      <filter id="glow-sol" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Outer Orbital Ring (Static) */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke={color}
      strokeWidth="0.5"
      strokeOpacity="0.3"
      strokeDasharray="10 5"
    />

    {/* Rotating Inner Ring */}
    <g
      style={{
        transformOrigin: "50px 50px",
        animation: "spinSlow 20s linear infinite",
      }}
    >
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="40 20"
      />
      <circle cx="50" cy="18" r="2" fill={color} />
    </g>

    {/* The Star Body */}
    <circle cx="50" cy="50" r="16" fill={color} fillOpacity="0.1" />
    <circle cx="50" cy="50" r="12" fill={color} filter="url(#glow-sol)" />

    {/* Cross Flare Effect */}
    <rect x="49" y="10" width="2" height="80" fill={color} fillOpacity="0.2" />
    <rect x="10" y="49" width="80" height="2" fill={color} fillOpacity="0.2" />
  </svg>
);

const CorelliIcon = ({ color }) => (
  <svg width="120" height="120" viewBox="0 0 100 100">
    <defs>
      <filter id="glow-corelli" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Tactical Brackets rotating reverse */}
    <g
      style={{
        transformOrigin: "50px 50px",
        animation: "spinReverse 15s linear infinite",
      }}
    >
      <path
        d="M20 20 L20 30 M20 20 L30 20"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M80 20 L80 30 M80 20 L70 20"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 80 L20 70 M20 80 L30 80"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M80 80 L80 70 M80 80 L70 80"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </g>

    {/* Central Star with 'scan' rings */}
    <circle cx="50" cy="50" r="14" fill={color} filter="url(#glow-corelli)" />
    <circle
      cx="50"
      cy="50"
      r="24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.4"
    >
      <animate
        attributeName="r"
        values="24;28;24"
        dur="2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="stroke-opacity"
        values="0.4;0;0.4"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

// --- Card Component ---
const SystemCard = ({ name, color, icon, onClick }) => {
  const cssVars = {
    "--card-color": color,
    "--card-glow": `${color}60`,
  };

  return (
    <div
      className="system-card"
      onClick={onClick}
      style={cssVars}
      role="button"
      tabIndex={0}
    >
      {/* Decorative corners */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.5,
        }}
      />

      <div className="card-icon">{icon}</div>
      <div className="card-name">{name}</div>
    </div>
  );
};

// --- Main Component ---
const SystemSelection = ({ onSelectSystem }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="system-selection-container">
        <div className="grid-background" />

        <div className="system-selection-content-wrapper">
          <div className="title-container">
            <h1 className="main-title">Destination</h1>
            <div className="subtitle">// SYSTEM SELECTION //</div>
          </div>

          <div className="cards-wrapper">
            <SystemCard
              name="SOL"
              color="#FFD700"
              icon={<SolIcon color="#FFD700" />}
              onClick={() => onSelectSystem("Sol")}
            />

            <SystemCard
              name="CORELLI"
              color="#00f5ff"
              icon={<CorelliIcon color="#00f5ff" />}
              onClick={() => onSelectSystem("Corelli")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemSelection;
