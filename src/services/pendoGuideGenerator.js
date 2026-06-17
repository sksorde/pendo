import releaseData from "../data/sprintReleaseCRs.json";

/**
 * Converts JSON → Pendo-ready guide structure
 */
export function generatePendoGuideFromJSON() {
  const guides = [];

  releaseData.crs.forEach((cr) => {
    const guide = {
      id: cr.crId,
      title: `${cr.crId} - ${cr.title}`,
      steps: buildSteps(cr),
      activationEvent: `CR_${cr.crId}_VIEWED`
    };

    guides.push(guide);
  });

  return guides;
}

/**
 * Build Siebel-style walkthrough steps
 */
function buildSteps(cr) {
  return [
    {
      type: "info",
      title: "Case Selection",
      text: `Start with ${cr.crId} - ${cr.title}`
    },
    {
      type: "screen",
      target: "cr-card",
      text: "Select the correct case from list"
    },
    {
      type: "field",
      target: "field-evidence-received",
      text: "Verify Evidence Received status"
    },
    {
      type: "field",
      target: "field-income-amount",
      text: "Check or update Income Amount"
    },
    {
      type: "action",
      target: "recalculate-btn",
      text: "Click Recalculate to apply changes"
    }
  ];
}

/**
 * Trigger guide dynamically
 */
export function triggerGuide(crId) {
  if (!window.pendo) return;

  window.pendo.track(`CR_${crId}_VIEWED`);
}