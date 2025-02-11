"use strict";

const AvoInspector = require("../AvoInspector");

// This function should return null if the event is not a product event, otherwise it should return filtered event properties
function filterProductEvents(eventName, eventProperties) {
  // filter out bad events, like GTM stuff and Adobe stuff that gets pushed to the datalayer and is not an "product event"
  // call a function that filters out events that are not product events and filters out the event properties to reduce the amount of automatic gtm/adobe properties

  if (eventName.includes("gtm")) {
    return null;
  }
  // Filter out unwanted properties
  const filteredProperties = {};
  for (const key in eventProperties) {
    if (
      eventProperties.hasOwnProperty(key) &&
      !key.startsWith("gtm.") &&
      !key.startsWith("gtag.") &&
      !key.startsWith("firebase_") &&
      !key.startsWith("ga_") &&
      !key.startsWith("google_") &&
      !key.startsWith("_")
    ) {
      filteredProperties[key] = eventProperties[key];
    } else {
      console.log("skipping property", key);
    }
  }

  return filteredProperties;
}

module.exports = function (settings, context) {
  // Extract the data passed by the dataLayerPush event

  const { pushData } = context;

  if (!pushData || typeof pushData !== "object") {
    console.warn(
      "trackDataLayer action: No pushData found in the event context."
    );
    return;
  }

  if (!pushData.eventName && !pushData.event) {
    console.warn(
      "trackDataLayer action: No eventName found in the pushData. Skipping event." +
        JSON.stringify(pushData)
    );
    return;
  }

  // We have validated that eventName is present, so we can safely destructure it
  const { event, eventName, ...eventProperties } = pushData;
  const eventNameToUse = eventName || event;

  // filter out bad events, like GTM stuff and Adobe stuff that gets pushed to the datalayer and is not an "product event"
  // call a function that filters out events that are not product events and filters out the event properties to reduce the amount of automatic gtm/adobe properties

  console.log("eventNameToUse", eventNameToUse);
  console.log("eventProperties", eventProperties);
  const filteredEventProperties = filterProductEvents(
    eventNameToUse,
    eventProperties
  );

  if (filteredEventProperties === null) {
    console.log(
      "filteredEventProperties is null, skipping event: " + eventNameToUse
    );
    return;
  }

  // // Log for debugging
  // console.log("trackDataLayer action triggered");
  // console.log("Event Name:", eventName);
  // console.log("Event Properties:", eventProperties);

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

  avoInspector.trackSchemaFromEvent(eventNameToUse, filteredEventProperties);
};
