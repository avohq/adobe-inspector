"use strict";

const AvoInspector = require("../AvoInspector");

// Function to filter out unwanted events
function filterProductEvents(eventName, eventProperties) {
  // Ignore Adobe system events
  if (eventName.startsWith("adobe.")) {
    console.log("[Avo Inspector] Skipping Adobe system event:", eventName);
    return null;
  }

  // Remove system-generated properties
  const filteredProperties = {};
  for (const key in eventProperties) {
    if (
      eventProperties.hasOwnProperty(key) &&
      !key.startsWith("adobe.") &&
      !key.startsWith("xdm.") &&
      !key.startsWith("queryParams.") &&
      !key.startsWith("timestamp") &&
      !key.startsWith("time")
    ) {
      filteredProperties[key] = eventProperties[key];
    } else {
      console.log("[Avo Inspector] Skipping system property:", key);
    }
  }
  return filteredProperties;
}

function captureMessage(message) {
  if (!message || !message.event) {
    console.warn("[Avo Inspector] Skipping non-tracked event:", message.event);
    return;
  }

  const { event: eventName, ...eventProperties } = message;

  return {
    eventName,
    eventProperties,
  };
}

module.exports = function (settings, context) {
  const { message } = context;

  const event = pushData ? capturePushData(pushData) : captureMessage(message);

  if (!event) {
    console.warn("No event found in context", context);
    return;
  }

  const { eventName, eventProperties } = event;

  // Extract filter prefixes from settings or context
  const eventNamePrefixes = settings.eventNamePrefixes || ["adobe."];
  const propertyPrefixes = settings.propertyPrefixes || [
    "adobe.",
    "xdm.",
    "queryParams.",
    "timestamp",
    "time",
  ];

  // Send the data to Avo Inspector
  const extensionSettings = turbine.getExtensionSettings();
  const apiKey = extensionSettings.apiKey;
  const environment = extensionSettings.environment || "dev";
  const appVersion = extensionSettings.appVersion || "1.0.0";

  const avoInspector = new AvoInspector({
    apiKey,
    env: environment,
    version: appVersion,
  });

  // Filter out system properties
  const filteredEventProperties = filterProductEvents(
    eventName,
    eventProperties
  );

  if (filteredEventProperties === null) {
    console.log(
      "[Avo Inspector] Filtered properties is null, skipping event:",
      eventName
    );
    return;
  }

  avoInspector.trackSchemaFromEvent(eventName, filteredEventProperties);
};
