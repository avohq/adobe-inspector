module.exports = function (settings, trigger) {
  if (!window.adobeDataLayer) {
    console.warn("Adobe Data Layer is missing! Initializing...");
    window.adobeDataLayer = [];
  }

  console.log("Listening for ACDL events...");

  function processEvent(eventData) {
    if (eventData.event === "adobe.analytics.trackEvent") {
      console.log("Captured Adobe Analytics event:", eventData);
      trigger({ pushData: eventData });
    }
  }

  // Override adobeDataLayer.push to capture only trackEvent
  const originalPush = window.adobeDataLayer.push;
  window.adobeDataLayer.push = function (...args) {
    originalPush.apply(this, args);
    processEvent(args[0]);
  };

  // Process past events (ACDL stores previous events)
  window.adobeDataLayer.forEach(processEvent);
};
