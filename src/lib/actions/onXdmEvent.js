"use strict";

const AvoInspector = require("../AvoInspector");

function convertXdmToEvent(xdmData, xdmFieldsToInclude, tenantId) {
  // if there is a object field that starts with _, its most likely the custom properties that the client has added,
  // we need to extract those from the key and have them top level

  // get the event name
  const eventName = xdmData.eventType;

  const eventProperties = {};
  for (const key in xdmData) {
    if (xdmFieldsToInclude.includes(key)) {
      eventProperties[key] = xdmData[key];
    } else if (key === tenantId) {
      // Extract all properties from the tenant object and add them at the top level
      const tenantProperties = xdmData[key];
      for (const tenantKey in tenantProperties) {
        eventProperties[tenantKey] = tenantProperties[tenantKey];
      }
    }
  }
  console.log("Event name", eventName);
  console.log("EVENT PROPERTIES", eventProperties);

  return {
    eventName,
    eventProperties,
  };
}

module.exports = function (settings, payload) {
  console.log("logging payload", payload);
  console.log("Executing onXdmEvent action with payload:", payload.xdmData);
  console.log("SETTINGS", settings);

  // Send the data to Avo Inspector
  const extensionSettings = turbine.getExtensionSettings();
  const apiKey = extensionSettings.apiKey;
  const environment = extensionSettings.environment || "dev";
  const appVersion = extensionSettings.appVersion || "1.0.0";

  console.log("DONE WITH GETTING SETTINGS FOR INSPECTOR");

  const avoInspector = new AvoInspector({
    apiKey,
    env: environment,
    version: appVersion,
  });

  const xdmFieldsToInclude = settings.xdmFields;
  const tenantId = settings.tenantId;

  console.log("XDM FIELDS TO INCLUDE", xdmFieldsToInclude, tenantId);

  const event = convertXdmToEvent(
    payload.xdmData,
    xdmFieldsToInclude,
    tenantId
  );

  if (environment === "dev") {
    console.log("[DEV] Avo Inspector Event:", event);
  }
  avoInspector.trackSchemaFromEvent(event.eventName, event.eventProperties);
};
