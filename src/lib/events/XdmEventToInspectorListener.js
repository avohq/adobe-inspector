module.exports = function (settings, trigger) {
  // Validate Avo Inspector initialization
  const extensionSettings = turbine.getExtensionSettings();
  if (!extensionSettings) {
    console.error(
      "[Avo Inspector] Extension settings not found. Please ensure the extension is properly configured."
    );
    return function noop() {};
  }

  const apiKey = extensionSettings.apiKey;
  if (!apiKey) {
    console.error(
      "[Avo Inspector] API key not found in extension settings. Please configure the API key in the extension settings."
    );
    return function noop() {};
  }

  function eventHandler(event) {
    if (event.type === "xdmEventToInspector") {
      // Pass the entire event object to Adobe Launch rule
      trigger({
        event: event,
        xdmData: event.detail.xdmData,
      });
    }
  }

  document.addEventListener("xdmEventToInspector", eventHandler);

  // Cleanup: Remove listener when rule deactivates
  return function cleanup() {
    document.removeEventListener("xdmEventToInspector", eventHandler);
  };
};
