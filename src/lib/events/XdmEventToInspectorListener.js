module.exports = function (settings, trigger) {
  function eventHandler(event) {
    if (event.type === "xdmEventToInspector") {
      // Pass event details to Adobe Launch rule
      trigger({
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
