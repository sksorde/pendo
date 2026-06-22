import { useEffect, useMemo, useState } from "react";
import releaseData from "./data/sprintReleaseCRs.json";
import { initializePendo } from "./services/pendoService";
import "./App.css";

const SCREEN_LABELS = {
  case_overview: "Case Overview",
  income_details: "Income Details",
  income_action: "Change of Income Action",
  payment_history: "Payment History",
  notes_screen: "Notes"
};

const SAMPLE_CASE = {
  ref: "CMS-2026-0847291",
  payingParent: "David Thompson",
  receivingParent: "Sarah Thompson",
  child: "Emily Thompson",
  status: "Active",
  niNumber: "AB 12 34 56 C",
  dob: "14/03/1987",
  currentIncome: "£32,000",
  incomeSource: "Employer / HMRC",
  evidenceReceived: "Pending",
  newIncome: "£21,000",
  effectiveDate: "01/06/2026",
  recalculatedAmount: "£42.30/week",
  arrears: "£0.00"
};

function mapReleaseScreen(screen = "") {
  const s = screen.toLowerCase();

  if (s.includes("income") && s.includes("action")) return "income_action";
  if (s.includes("income")) return "income_details";
  if (s.includes("payment")) return "payment_history";
  if (s.includes("note")) return "notes_screen";
  return "case_overview";
}

function fieldKey(field = "") {
  return field
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function SiebelField({ label, value, pendo, highlight }) {
  return (
    <div className={`siebel-field ${highlight ? "field-highlight" : ""}`} data-pendo={pendo}>
      <label>{label}</label>
      <div className="siebel-value">{value}</div>
    </div>
  );
}

function SiebelMockScreen({ activeScreen, selectedCR }) {
  const impacted = selectedCR.fields.map(fieldKey);

  return (
    <div className="siebel-shell" data-pendo="siebel-shell">
      <div className="siebel-topbar">
        <div>
          <b>Siebel Public Sector CRM</b>
          <span> Child Maintenance Service</span>
        </div>
        <div>Caseworker: caseworker001</div>
      </div>

      <div className="siebel-titlebar">
        <div>
          <h2 data-pendo="siebel-case-title">Case {SAMPLE_CASE.ref}</h2>
          <p>{SCREEN_LABELS[activeScreen]}</p>
        </div>
        <button className="siebel-action" data-pendo="siebel-save-btn">Save</button>
      </div>

      <div className="siebel-tabs">
        {Object.entries(SCREEN_LABELS).map(([id, label]) => (
          <div
            key={id}
            className={`siebel-tab ${activeScreen === id ? "active" : ""}`}
            data-pendo={`tab-${id}`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="siebel-body">
        {activeScreen === "case_overview" && (
          <>
            <h3>Case Summary</h3>
            <div className="siebel-grid">
              <SiebelField label="Case Reference" value={SAMPLE_CASE.ref} pendo="field-case-reference" />
              <SiebelField label="Paying Parent" value={SAMPLE_CASE.payingParent} pendo="field-paying-parent" />
              <SiebelField label="Receiving Parent" value={SAMPLE_CASE.receivingParent} pendo="field-receiving-parent" />
              <SiebelField label="Child" value={SAMPLE_CASE.child} pendo="field-child" />
              <SiebelField label="Status" value={SAMPLE_CASE.status} pendo="field-status" />
              <SiebelField label="National Insurance Number" value={SAMPLE_CASE.niNumber} pendo="field-national-insurance-number" />
              <SiebelField label="Date of Birth" value={SAMPLE_CASE.dob} pendo="field-date-of-birth" />
            </div>
          </>
        )}

        {activeScreen === "income_details" && (
          <>
            <h3>Income Details</h3>
            <div className="siebel-grid">
              <SiebelField
                label="Current Income Amount"
                value={SAMPLE_CASE.currentIncome}
                pendo="field-income-amount"
                highlight={impacted.includes("income-amount")}
              />
              <SiebelField
                label="Income Source"
                value={SAMPLE_CASE.incomeSource}
                pendo="field-income-source"
                highlight={impacted.includes("income-source")}
              />
              <SiebelField
                label="Evidence Received"
                value={SAMPLE_CASE.evidenceReceived}
                pendo="field-evidence-received"
                highlight={impacted.includes("evidence-received")}
              />
            </div>
          </>
        )}

        {activeScreen === "income_action" && (
          <>
            <h3>Change of Income Action</h3>
            <div className="siebel-grid">
              <SiebelField label="Reason for Change" value="Customer reported income reduction" pendo="field-reason-for-change" />
              <SiebelField label="New Income Amount" value={SAMPLE_CASE.newIncome} pendo="field-new-income-amount" />
              <SiebelField label="Effective Date" value={SAMPLE_CASE.effectiveDate} pendo="field-effective-date" />
              <SiebelField label="Evidence Received" value={SAMPLE_CASE.evidenceReceived} pendo="field-evidence-received" />
              <SiebelField label="New Weekly Maintenance" value={SAMPLE_CASE.recalculatedAmount} pendo="field-new-weekly-maintenance" />
            </div>

            <button className="primary-button siebel-recalc" data-pendo="recalculate-btn">
              Recalculate Maintenance
            </button>
          </>
        )}

        {activeScreen === "payment_history" && (
          <>
            <h3>Payment History</h3>
            <div className="siebel-grid">
              <SiebelField label="Collection Method" value="Direct Pay" pendo="field-collection-method" />
              <SiebelField label="Current Arrears" value={SAMPLE_CASE.arrears} pendo="field-arrears" />
              <SiebelField label="Last Payment" value="£61.54 on 07/06/2026" pendo="field-last-payment" />
            </div>
          </>
        )}

        {activeScreen === "notes_screen" && (
          <>
            <h3>Case Notes</h3>
            <textarea
              className="siebel-notes"
              data-pendo="field-note-text"
              defaultValue={`Release guide opened for ${selectedCR.crId}. Caseworker should review impacted fields and complete guided steps.`}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCR, setSelectedCR] = useState(releaseData.crs[0]);

  const user = {
    id: "caseworker001",
    email: "caseworker001@dwp.gov.uk",
    role: "Caseworker"
  };

  const activeScreen = useMemo(
    () => mapReleaseScreen(selectedCR.screen),
    [selectedCR]
  );

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

    setTimeout(() => {
      if (window.pendo) {
        window.pendo.pageLoad();
        window.pendo.track("SPRINT_CR_VIEWED", {
          releaseId: releaseData.releaseId,
          crId: cr.crId,
          title: cr.title,
          screen: cr.screen
        });
      }
    }, 300);
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
              className={`cr-button ${selectedCR.crId === cr.crId ? "selected" : ""}`}
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

          <p><b>Use Case:</b> {selectedCR.useCase}</p>

          <p>
            <b>Impacted Siebel Screen:</b>{" "}
            <span data-pendo="impacted-screen">{selectedCR.screen}</span>
          </p>

          <h4>Impacted Fields</h4>

          <div className="fields">
            {selectedCR.fields.map((field) => (
              <span
                key={field}
                className="field-chip"
                data-pendo={`field-${fieldKey(field)}`}
              >
                {field}
              </span>
            ))}
          </div>

          <h4 data-pendo="guided-journey-title">Guided Journey</h4>

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

              window.pendo.pageLoad();
              window.pendo.track("CR_CLICKED", {
                crId: selectedCR.crId
              });

              try {
                window.pendo.showGuideById("Aj55tdKpEVBaA_kw3DwBxPt67Co");
              } catch (e) {
                console.log("Guide not found or not published", e);
              }
            }}
          >
            Launch Pendo Guide
          </button>
        </div>
      </div>

      <SiebelMockScreen activeScreen={activeScreen} selectedCR={selectedCR} />
    </div>
  );
}