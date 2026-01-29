import React, { useState } from "react";
import "./LegalModal.css";

const LegalModal = ({ onAccept, onReject }) => {
  const [acceptedCLA, setAcceptedCLA] = useState(false);
  const [acceptedToS, setAcceptedToS] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);

  const handleProceed = () => {
    if (acceptedCLA && acceptedToS && acceptedAge) {
      // Set cookie to remember acceptance (expires in 10 years)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 10);
      document.cookie = `solar_wars_legal_accepted=true; expires=${expiryDate.toUTCString()}; path=/`;
      onAccept();
    } else {
      // Redirect to Google if not all checkboxes are accepted
      window.location.href = "https://www.google.com";
      onReject();
    }
  };

  return (
    <div className="legal-modal-overlay">
      <div className="legal-modal-container">
        <div className="legal-modal-header">
          <h1>SOLAR WARS - LEGAL AGREEMENT</h1>
          <div className="header-line"></div>
        </div>

        <div className="legal-modal-content">
          {/* --- SECTION 1: CONTRIBUTOR LICENSE AGREEMENT (CLA) --- */}
          <div className="legal-section">
            <h2>1. Contributor License Agreement (CLA)</h2>
            <p className="legal-subtitle">
              <em>
                *This section applies only if you submit code, art, or ideas to
                the game.*
              </em>
            </p>

            <div className="legal-text">
              <h3>1.1. Parties & Definitions</h3>
              <p>
                This agreement is between <strong>"Fer0"</strong> (the Project
                Owner) and you (the "Contributor").
                <strong>"Contributions"</strong> refer to any material (code,
                assets, ideas) you submit to the project via GitHub, Discord,
                Email, or other channels.
              </p>

              <h3>1.2. Code Contributions (Assignment of Rights)</h3>
              <p>
                By submitting source code, scripts, or algorithms, you agree to{" "}
                <strong>assign and transfer</strong> all economic rights
                (copyright) of said code to the Project Owner (Fer0).
              </p>
              <ul>
                <li>
                  This transfer is total, exclusive, perpetual, and definitive.
                </li>
                <li>
                  Fer0 becomes the sole owner of the code and may freely decide
                  on its future (including closing the source, commercializing,
                  or discontinuing it) without further permission or
                  compensation.
                </li>
              </ul>

              <h3>1.3. Art & Asset Contributions (License)</h3>
              <p>
                By submitting artistic assets (visuals, audio, 3D models,
                narrative), you <strong>retain ownership</strong> (copyright) of
                your work.
              </p>
              <ul>
                <li>
                  However, you grant the Project Owner a{" "}
                  <strong>
                    non-exclusive, worldwide, perpetual, irrevocable, and
                    royalty-free license
                  </strong>{" "}
                  to use, modify, adapt, and distribute the art within "Solar
                  Wars Web" and its promotional materials.
                </li>
                <li>
                  You acknowledge that Fer0 is not obligated to use the art and
                  may remove it from the game at any time.
                </li>
              </ul>

              <h3>1.4. Ideas & Feedback</h3>
              <p>
                Any game mechanics, suggestions, feedback, or narrative concepts
                provided by you are submitted on a{" "}
                <strong>non-confidential basis</strong>. The Project Owner is
                free to use, implement, and monetize these ideas without any
                obligation of credit or financial compensation.
              </p>

              <h3>1.5. Moral Rights & Credits</h3>
              <p>
                The Project Owner agrees to credit you for your contributions
                (unless you request anonymity). Given the nature of software
                development, you explicitly authorize necessary technical or
                artistic modifications to your contributions to ensure the
                game's functionality and compatibility.
              </p>
            </div>
          </div>

          <hr className="legal-divider" />

          {/* --- SECTION 2: TERMS OF SERVICE (ToS) --- */}
          <div className="legal-section">
            <h2>2. Terms of Service (ToS)</h2>
            <p className="legal-subtitle">
              <em>*By playing Solar Wars Web, you agree to these rules.*</em>
            </p>

            <div className="legal-text">
              <h3>2.1. License to Play</h3>
              <p>
                Solar Wars Web is provided by Fer0. You are granted a limited,
                non-exclusive, non-transferable, and revocable license to access
                and play the game strictly for personal, non-commercial
                entertainment purposes.
              </p>

              <h3>2.2. Prohibited Acts (No Copying)</h3>
              <p>
                You acknowledge that the game's code, art, mechanics, and design
                are the exclusive property of Fer0.{" "}
                <strong>You are strictly prohibited from:</strong>
              </p>
              <ul>
                <li>
                  Copying, reproducing, distributing, "ripping", or cloning the
                  game or any part of its content.
                </li>
                <li>
                  Reverse engineering, decompiling, or attempting to derive the
                  source code (except where strictly permitted by the CLA).
                </li>
                <li>
                  Using bots, hacks, unauthorized mods, or automation tools.
                </li>
                <li>
                  Selling, renting, or commercially exploiting your account or
                  in-game items.
                </li>
                <li>
                  <strong>AI Training:</strong> Using any part of the game
                  (text, code, art, lore) to train Artificial Intelligence (AI)
                  models, Large Language Models (LLMs), or machine learning
                  datasets.
                  <br />
                </li>
              </ul>

              <h3>2.3. Virtual Goods</h3>
              <p>
                All in-game items, ships, currencies, or data are{" "}
                <strong>fictional</strong> and have no real-world monetary
                value. You do not own these items. The Project Owner reserves
                the right to manage, modify, reset, or delete user data and
                virtual goods at any time during development or operation.
              </p>

              <h3>2.4. Disclaimer of Warranties ("As Is")</h3>
              <p>
                The game is provided "as is" and "as available". The Project
                Owner makes no warranties regarding the game's uptime, security,
                or bug-free status.
              </p>

              <h3>2.5. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, the Project
                Owner shall not be liable for any direct, indirect, incidental,
                or consequential damages (including loss of data) resulting from
                the use of the game.
                <br />
              </p>

              <h3>2.6. Governing Law</h3>
              <p>
                This agreement is governed by the laws of{" "}
                <strong>Portugal</strong>. Any disputes arising from this
                agreement shall be subject to the exclusive jurisdiction of the
                courts of Portugal.
              </p>
            </div>
          </div>
          <hr className="legal-divider" />

          {/* --- SECTION 3: PRIVACY & COOKIE POLICY --- */}
          <div className="legal-section">
            <h2>3. Privacy & Data Policy</h2>
            <div className="legal-text">
              <h3>3.1. Data Minimization</h3>
              <p>
                We practice strict data minimization. To play Solar Wars Web, we
                collect only:
              </p>
              <ul>
                <li>
                  <strong>Nation Name:</strong> Your public identifier in the
                  game.
                </li>
                <li>
                  <strong>Wiki Account (Optional):</strong> Required only if you
                  contribute to the Wiki.
                </li>
              </ul>
              <p>
                We do <strong>not</strong> store IP addresses, browser history,
                real names, or passwords for the game itself on our servers.
              </p>

              <h3>3.2. Cookies & Local Storage (Functional Only)</h3>
              <p>
                We use <strong>Functional Cookies</strong> and{" "}
                <strong>Local Storage</strong>. These are technical files saved
                on your device strictly necessary for the game to function.
              </p>
              <p>
                <strong>We use them for:</strong>
              </p>
              <ul>
                <li>
                  <strong>Game State:</strong> Maintaining your connection to
                  the game database (Session).
                </li>
                <li>
                  <strong>UI Preferences:</strong> Remembering your interface
                  choices, such as <em>"Don't show this modal again"</em> or
                  volume settings.
                </li>
              </ul>
              <p>
                <strong>No Tracking:</strong> We do not use third-party
                advertising cookies, analytics trackers, or sell your browsing
                data.
              </p>

              <h3>3.3. Your Rights</h3>
              <p>
                Since we do not link your Nation Name to a real identity, we
                cannot identify you personally. If you wish to delete your data,
                you may request the deletion of your specific "Nation" via the
                community Discord.
              </p>
            </div>
          </div>

          <div className="legal-checkboxes">
            <label className="legal-checkbox">
              <input
                type="checkbox"
                checked={acceptedAge}
                onChange={(e) => setAcceptedAge(e.target.checked)}
              />
              <span style={{ fontSize: "0.9em" }}>
                I confirm that I will <strong>only submit contributions</strong>{" "}
                (Code, Art, or Ideas) if I am{" "}
                <strong>16 years of age or older</strong> (or have explicit
                parental consent).
              </span>
            </label>

            <label className="legal-checkbox">
              <input
                type="checkbox"
                checked={acceptedCLA}
                onChange={(e) => setAcceptedCLA(e.target.checked)}
              />
              <span className="checkbox-text">
                I have read and agree to the Contributor License Agreement
              </span>
            </label>

            <label className="legal-checkbox">
              <input
                type="checkbox"
                checked={acceptedToS}
                onChange={(e) => setAcceptedToS(e.target.checked)}
              />
              <span className="checkbox-text">
                I have read and agree to the Terms of Service
              </span>
            </label>
          </div>
        </div>

        <div className="legal-modal-footer">
          <button
            className={`legal-btn ${
              acceptedCLA && acceptedToS && acceptedAge
                ? "legal-btn-enabled"
                : "legal-btn-disabled"
            }`}
            onClick={handleProceed}
          >
            {acceptedCLA && acceptedToS && acceptedAge
              ? "PROCEED"
              : "ACCEPT ALL TO PROCEED"}
          </button>
          <p className="legal-warning">
            {!acceptedCLA || !acceptedToS || !acceptedAge
              ? "You must accept all agreements to access Solar Wars Web."
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
