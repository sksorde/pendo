export function initializePendo(user, releaseData) {
  if (!window.pendo) {
    console.warn("Pendo script not loaded.");
    return;
  }

  window.pendo.initialize({
    visitor: {
      id: user.id,
      email: user.email,
      role: user.role,
      release_id: releaseData.releaseId,
      release_name: releaseData.releaseName
    },
    account: {
      id: "DWP-CMS",
      name: "DWP CMS",
      application: "Siebel Public Sector IP 20.9"
    }
  }); 
} 