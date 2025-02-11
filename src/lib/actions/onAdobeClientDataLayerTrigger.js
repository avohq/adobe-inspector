"use strict";

const AvoInspector = require("../AvoInspector");

// Function to filter out unwanted events
function filterProductEvents(eventName, eventProperties) {
  // Ignore Adobe system events
  if (eventName.startsWith("adobe.")) {
    console.log("Skipping Adobe system event:", eventName);
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
      console.log("Skipping system property:", key);
    }
  }
  return filteredProperties;
}

module.exports = function (settings, context) {
  const { pushData } = context;

  if (!pushData || pushData.event !== "adobe.analytics.trackEvent") {
    console.warn("Skipping non-tracked event:", pushData.event);
    return;
  }

  // Extract event properties
  const { eventInfo } = pushData;
  if (!eventInfo) {
    console.warn("No eventInfo found in adobe.analytics.trackEvent.");
    return;
  }

  // Extract filter prefixes from settings or context
  const eventNamePrefixes = settings.eventNamePrefixes || ["adobe."];
  const propertyPrefixes = settings.propertyPrefixes || [
    "adobe.",
    "xdm.",
    "queryParams.",
    "timestamp",
    "time",
  ];

  console.log("Processing Adobe Analytics Event:", eventInfo);

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

  console.log("eventInfo", eventInfo);

  // Remove eventType from properties since it's used as the event name
  const { eventType, ...eventProperties } = eventInfo;

  console.log("eventType", eventType);
  console.log("eventProperties", eventProperties);

  // Filter out system properties
  const filteredEventProperties = filterProductEvents(
    eventType,
    eventProperties
  );

  console.log("filteredEventProperties", filteredEventProperties);

  if (filteredEventProperties === null) {
    console.log("Filtered properties is null, skipping event:", eventType);
    return;
  }

  avoInspector.trackSchemaFromEvent(eventType, filteredEventProperties);
};
