"use strict";

const AvoInspector = require("../AvoInspector");

// Function to filter out unwanted events
function filterProductEvents(
  eventName,
  eventProperties,
  filteredEventNamePrefixes,
  filteredPropertyPrefixes,
  environment
) {
  // Ignore Adobe system events
  if (
    filteredEventNamePrefixes.some((prefix) => eventName.startsWith(prefix))
  ) {
    if (environment === "dev") {
      console.log("[Avo Inspector] Skipping Adobe system event:", eventName);
    }
    return null;
  }

  // Remove system-generated properties
  const filteredProperties = {};
  for (const key in eventProperties) {
    if (
      eventProperties.hasOwnProperty(key) &&
      !filteredPropertyPrefixes.some((prefix) => key.startsWith(prefix))
    ) {
      filteredProperties[key] = eventProperties[key];
    } else {
      if (environment === "dev") {
        console.log("[Avo Inspector] Skipping system property:", key);
      }
    }
  }
  return filteredProperties;
}

function captureACDLMessage(message, environment) {
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

function captureGoogleDLMessage(dataLayerModel, environment) {
  if (!dataLayerModel || !dataLayerModel.event) {
    if (environment === "dev") {
      console.warn(
        "[Avo Inspector] Skipping non-tracked event:",
        dataLayerModel.event
      );
    }
    return;
  }

  const { event: eventName, ...eventProperties } = dataLayerModel;

  return {
    eventName,
    eventProperties,
  };
}
module.exports = function (settings, context) {
  const { message } = context;

  // Send the data to Avo Inspector
  const extensionSettings = turbine.getExtensionSettings();
  const apiKey = extensionSettings.apiKey;
  const environment = extensionSettings.environment || "dev";
  const appVersion = extensionSettings.appVersion || "1.0.0";

  if (environment === "dev") {
    console.log("[Avo Inspector] Context:", context);
  }

  const event = message
    ? captureACDLMessage(message, environment)
    : captureGoogleDLMessage(context.event.dataLayerModel, environment);

  if (environment === "dev") {
    console.log("[Avo Inspector] Event:", event);
  }

  if (!event) {
    if (environment === "dev") {
      console.warn("No event found in context", context);
    }
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

  const avoInspector = new AvoInspector({
    apiKey,
    env: environment,
    version: appVersion,
  });

  // Filter out system properties
  const filteredEventProperties = filterProductEvents(
    eventName,
    eventProperties,
    eventNamePrefixes,
    propertyPrefixes
  );

  if (filteredEventProperties === null) {
    if (environment === "dev") {
      console.log(
        "[Avo Inspector] Filtered properties is null, skipping event:",
        eventName
      );
    }
    return;
  }

  avoInspector.trackSchemaFromEvent(eventName, filteredEventProperties);
};
