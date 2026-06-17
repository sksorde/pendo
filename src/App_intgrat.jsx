import { useEffect, useState } from "react";
import releaseData from "./data/sprintReleaseCRs.json";
import { initializePendo } from "./services/pendoService";
import "./App.css";
import { triggerGuide } from "./services/pendoGuideGenerator";

export default function App() {
  const [selectedCR, setSelectedCR] = useState(releaseData.crs[0]);

  const user = {
    id: "caseworker001",
    email: "caseworker001@dwp.gov.uk",
    role: "Caseworker"
  };

  useEffect(() => {
    initializePendo(user, releaseData);

    if (window.pendo) {
      window.pendo.identify({
        visitor: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        account: {
          id: "CMS-DWP",
          name: "CMS DWP"
        }
      });

      window.pendo.pageLoad();
    }
  }, []);


  function startGuide(cr) {
    setSelectedCR(cr);

    if (window.pendo) {
      window.pendo.track("CR_SELECTED", {
        releaseId: releaseData.releaseId,
        crId: cr.crId,
        title: cr.title
      });
    }
  }

  return (
    <div className="page">
      <h1>AI-Powered Pendo Sprint Release Guide</h1>

      {/* RELEASE HEADER */}
      <div className="release-card" data-pendo="release-card">
        <h2>{releaseData.releaseName}</h2>
        <p><b>Release Date:</b> {releaseData.releaseDate}</p>
        <p><b>Target Roles:</b> {releaseData.targetRoles.join(", ")}</p>
      </div>

      <div className="layout">

        {/* LEFT PANEL - CR LIST */}
        <div className="left-panel">
          <h3>Delivered CRs</h3>

          {releaseData.crs.map((cr) => (
            <button
              key={cr.crId}
              className="cr-button"
              data-pendo="cr-card"
              data-crid={cr.crId}
              onClick={() => startGuide(cr)}
            >
              {cr.crId} - {cr.title}
            </button>
          ))}
        </div>

        {/* RIGHT PANEL - DETAILS */}
        <div className="right-panel">

          {/* CR TITLE */}
          <h3 data-pendo="cr-title">{selectedCR.title}</h3>

          <p><b>Use Case:</b> {selectedCR.useCase}</p>

          <p>
            <b>Impacted Siebel Screen:</b>{" "}
            <span data-pendo="impacted-screen">
              {selectedCR.screen}
            </span>
          </p>

          {/* FIXED PENDO FIELD 1 */}
          <div
            className="field-box"
            data-pendo="field-evidence-received"
          >
            <b>Evidence Received:</b> Yes / No (Simulated Field)
          </div>

          {/* FIXED PENDO FIELD 2 */}
          <div
            className="field-box"
            data-pendo="field-income-amount"
          >
            <b>Income Amount:</b> £32,000 (Sample Value)
          </div>

          {/* IMPACTED FIELDS (FROM JSON) */}
          <h4>Impacted Fields</h4>

          <div className="fields">
            {selectedCR.fields.map((field) => {
              const safeKey = field
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              return (
                <span
                  key={field}
                  className="field-chip"
                  data-pendo={`field-${safeKey}`}
                >
                  {field}
                </span>
              );
            })}
          </div>

          {/* GUIDED JOURNEY */}
          <h4 data-pendo="guided-journey-title">
            Guided Journey
          </h4>

          <ol data-pendo="guided-steps">
            {selectedCR.guideSteps.map((step, index) => (
              <li key={index} data-pendo={`step-${index + 1}`}>
                {step}
              </li>
            ))}
          </ol>

          {/* RECALCULATE BUTTON (IMPORTANT FOR PENDO) */}
          <button
            className="primary-button"
            data-pendo="recalculate-btn"
            onClick={() => alert("Recalculation triggered")}
          >
            Recalculate
          </button>

          <br /><br />

          {/* LAUNCH GUIDE BUTTON */}
          <button
            className="primary-button"
            data-pendo="launch-guide-btn"
            onClick={() => {
              if (window.pendo) {
                window.pendo.track("LAUNCH_GUIDE_CLICKED", {
                  crId: selectedCR.crId
                });
              } else {
                alert("Pendo not loaded");
              }
            }}
          >
            Launch Pendo Guide
          </button>

        </div>
      </div>
    </div>
  );
}