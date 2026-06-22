import { useEffect, useState } from "react";
import releaseData from "./data/sprintReleaseCRs.json";
import { initializePendo } from "./services/pendoService";
import "./App.css";

export default function App() {
  const [selectedCR, setSelectedCR] = useState(releaseData.crs[0]);

  const user = {
    id: "caseworker001",
    email: "caseworker001@dwp.gov.uk",
    role: "Caseworker"
  };

  // ✅ FIX 1: Proper Pendo init + pageLoad sync
  useEffect(() => {
    initializePendo(user, releaseData);

    const timer = setTimeout(() => {
      if (window.pendo) {
        window.pendo.pageLoad();
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
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  function startGuide(cr) {
    setSelectedCR(cr);

    if (window.pendo) {
      window.pendo.track("SPRINT_CR_VIEWED", {
        releaseId: releaseData.releaseId,
        crId: cr.crId,
        title: cr.title,
        screen: cr.screen
      });
    }
  }

  return (
    <div className="page">
      <h1>AI-Powered Pendo Sprint Release Guide</h1>

      <div className="release-card" data-pendo="release-card">
        <h2>{releaseData.releaseName}</h2>
        <p><b>Release Date:</b> {releaseData.releaseDate}</p>
        <p><b>Target Roles:</b> {releaseData.targetRoles.join(", ")}</p>
      </div>

      <div className="layout">
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

        <div className="right-panel">
          <h3 data-pendo="cr-title">{selectedCR.title}</h3>

          <p>
            <b>Use Case:</b> {selectedCR.useCase}
          </p>

          <p>
            <b>Impacted Siebel Screen:</b>{" "}
            <span data-pendo="impacted-screen">
              {selectedCR.screen}
            </span>
          </p>

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

          <button
            className="primary-button"
            data-pendo="launch-guide-btn"
            onClick={() => {
              if (!window.pendo) {
                alert("Pendo not loaded");
                return;
              }

              window.pendo.track("CR_CLICKED", {
                crId: selectedCR.crId
              });

              // safer call
              try {
                window.pendo.showGuideById("hWGW4TONVand62h_hzAboiT_R5o");
              } catch (e) {
                console.log("Guide not found or not published", e);
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