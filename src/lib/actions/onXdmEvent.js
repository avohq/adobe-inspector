"use strict";

const AvoInspector = require("../AvoInspector");

function validatePath(path, pathType) {
  if (!path) {
    return { isValid: true }; // Empty paths are valid (optional)
  }

  // Check for invalid characters
  const invalidChars = /[^a-zA-Z0-9._]/;
  if (invalidChars.test(path)) {
    return {
      isValid: false,
      error: `Invalid ${pathType} path: contains invalid characters. Only letters, numbers, dots, and underscores are allowed.`,
    };
  }

  // Check for proper structure
  if (path.startsWith(".") || path.endsWith(".")) {
    return {
      isValid: false,
      error: `Invalid ${pathType} path: cannot start or end with a dot.`,
    };
  }

  // Check for empty segments or consecutive dots
  if (
    path.includes("..") ||
    path.split(".").some((segment) => segment === "")
  ) {
    return {
      isValid: false,
      error: `Invalid ${pathType} path: cannot contain consecutive dots or empty segments.`,
    };
  }

  return { isValid: true };
}

function convertXdmToEvent(
  event,
  xdmData,
  xdmFieldsToInclude,
  tenantId,
  tenantPath,
  eventNamePath,
  environment
) {
  // Validate paths
  const tenantPathValidation = validatePath(tenantPath, "tenant");
  const eventNamePathValidation = validatePath(eventNamePath, "event name");

  if (!tenantPathValidation.isValid) {
    console.error(`[Avo Inspector] ${tenantPathValidation.error}`);
    return null;
  }

  if (!eventNamePathValidation.isValid) {
    console.error(`[Avo Inspector] ${eventNamePathValidation.error}`);
    return null;
  }

  // Try to find XDM data from both possible locations
  let xdmObject = null;
  let xdmLocation = null;

  if (environment === "dev") {
    console.log("[Avo Inspector] Input event:", JSON.stringify(event, null, 2));
    console.log(
      "[Avo Inspector] Input xdmData:",
      JSON.stringify(xdmData, null, 2)
    );
  }

  // First try xdm, then fall back to xdmData
  if (event?.detail?.xdm) {
    xdmObject = event.detail.xdm;
    xdmLocation = "xdm";
  } else if (event?.detail?.xdmData) {
    xdmObject = event.detail.xdmData;
    xdmLocation = "xdmData";
  } else {
    xdmObject = xdmData;
  }

  if (environment === "dev") {
    console.log(
      "[Avo Inspector] Selected XDM location:",
      xdmLocation || "payload.xdmData"
    );
    console.log(
      "[Avo Inspector] Selected XDM object:",
      JSON.stringify(xdmObject, null, 2)
    );
  }

  const eventProperties = {};
  let eventName = undefined;

  // Try to get event name from the specified path if provided
  if (eventNamePath) {
    if (environment === "dev") {
      console.log(
        "[Avo Inspector] Looking for event name at path:",
        eventNamePath
      );
    }

    // Split the path and resolve it
    const pathParts = eventNamePath.split(".");
    let current = event;
    for (const part of pathParts) {
      if (current && typeof current === "object") {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }

    if (current) {
      eventName = current;
      if (environment === "dev") {
        console.log(
          "[Avo Inspector] Found event name at path:",
          eventNamePath,
          ":",
          eventName
        );
      }
    } else if (environment === "dev") {
      console.log(
        "[Avo Inspector] No event name found at path:",
        eventNamePath
      );
    }
  }

  // If no event name found via path, fall back to XDM eventType
  if (!eventName && xdmObject) {
    eventName = xdmObject.eventType;
    if (environment === "dev") {
      console.log("[Avo Inspector] Using eventType from XDM:", eventName);
    }
  }

  // Process XDM data if available
  if (xdmObject) {
    // Handle the standard XDM fields
    for (const key in xdmObject) {
      if (xdmFieldsToInclude.includes(key)) {
        eventProperties[key] = xdmObject[key];
      }
    }
  } else if (environment === "dev") {
    console.warn("[Avo Inspector] No XDM data found in event");
  }

  // Then handle the tenant properties
  let tenantProperties = null;

  // If tenantPath is provided, try to get properties from that path
  if (tenantPath) {
    if (environment === "dev" && tenantId) {
      console.log(
        "[Avo Inspector] Using tenantPath with tenantId as fallback:",
        {
          tenantPath,
          tenantId,
        }
      );
    }

    // If the path contains xdm/xdmData and we found the data in a different location,
    // adapt the path to use the correct location
    let adaptedPath = tenantPath;
    if (xdmLocation) {
      // Replace any occurrence of xdm or xdmData with the actual location
      // But only if the path contains the old location
      if (adaptedPath.includes("xdmData") && xdmLocation === "xdm") {
        adaptedPath = adaptedPath.replace("xdmData", "xdm");
      } else if (adaptedPath.includes("xdm") && xdmLocation === "xdmData") {
        adaptedPath = adaptedPath.replace("xdm", "xdmData");
      }
    }

    if (environment === "dev") {
      console.log("[Avo Inspector] Original tenant path:", tenantPath);
      console.log("[Avo Inspector] Adapted tenant path:", adaptedPath);
    }

    // Split the path and resolve it
    const pathParts = adaptedPath.split(".");
    let current = event;
    for (const part of pathParts) {
      if (current && typeof current === "object") {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }

    // If we found tenant properties, use them
    if (current && typeof current === "object") {
      tenantProperties = current;
      if (environment === "dev") {
        console.log(
          "[Avo Inspector] Found tenant properties at path:",
          adaptedPath
        );
      }
    } else if (environment === "dev") {
      console.log(
        "[Avo Inspector] No tenant properties found at path:",
        adaptedPath
      );
      if (tenantId) {
        console.log("[Avo Inspector] Will try fallback to tenantId:", tenantId);
      }
      console.log(
        "[Avo Inspector] Available paths:",
        JSON.stringify(event?.detail, null, 2)
      );
    }

    if (environment === "dev") {
      console.log(
        "[Avo Inspector] Found tenant properties:",
        tenantProperties ? JSON.stringify(tenantProperties, null, 2) : "no"
      );
    }
  }

  // If no tenant properties found via path, fall back to the old behavior
  if (!tenantProperties && tenantId && xdmObject) {
    if (environment === "dev") {
      console.log("[Avo Inspector] Falling back to tenantId:", tenantId);
    }
    tenantProperties = xdmObject[tenantId];
  }

  // If we found tenant properties, add them to the event properties
  if (tenantProperties && typeof tenantProperties === "object") {
    for (const tenantKey in tenantProperties) {
      eventProperties[tenantKey] = tenantProperties[tenantKey];
    }
  } else if (environment === "dev" && tenantPath) {
    console.warn(
      "[Avo Inspector] No tenant properties found using path:",
      tenantPath,
      "or fallback tenantId:",
      tenantId
    );
  }

  // Only return null if we have no data at all
  if (!xdmObject && !tenantProperties) {
    return null;
  }

  const result = {
    eventName,
    eventProperties,
  };

  if (environment === "dev") {
    console.log(
      "[Avo Inspector] Final result:",
      JSON.stringify(result, null, 2)
    );
  }

  return result;
}

module.exports = function (settings, payload) {
  // Validate Avo Inspector initialization
  const extensionSettings = turbine.getExtensionSettings();
  if (!extensionSettings) {
    console.error(
      "[Avo Inspector] Extension settings not found. Please ensure the extension is properly configured."
    );
    return;
  }

  const apiKey = extensionSettings.apiKey;
  if (!apiKey) {
    console.error(
      "[Avo Inspector] API key not found in extension settings. Please configure the API key in the extension settings."
    );
    return;
  }

  const environment = extensionSettings.environment || "dev";
  const appVersion = extensionSettings.appVersion || "1.0.0";

  if (environment === "dev") {
    console.log("[Avo Inspector] Payload:", payload);
    console.log("[Avo Inspector] Settings:", settings);
  }

  const avoInspector = new AvoInspector({
    apiKey,
    env: environment,
    version: appVersion,
  });

  // Validate Avo Inspector instance
  if (
    !avoInspector ||
    typeof avoInspector.trackSchemaFromEvent !== "function"
  ) {
    console.error(
      "[Avo Inspector] Failed to initialize Avo Inspector. Please check your configuration."
    );
    return;
  }

  const xdmFieldsToInclude = settings.xdmFields;
  const tenantId = settings.tenantId;
  const tenantPath = settings.tenantPath; // New setting for custom path
  const eventNamePath = settings.eventNamePath; // New setting for event name path

  if (environment === "dev") {
    console.log(
      "[Avo Inspector] XDM fields to include:",
      xdmFieldsToInclude,
      "Tenant ID:",
      tenantId,
      "Tenant Path:",
      tenantPath,
      "Event Name Path:",
      eventNamePath
    );
  }

  const event = convertXdmToEvent(
    payload.event,
    payload.xdmData,
    xdmFieldsToInclude,
    tenantId,
    tenantPath,
    eventNamePath,
    environment
  );

  if (!event) {
    if (environment === "dev") {
      console.warn("[Avo Inspector] No event data found to process");
    }
    return;
  }

  if (environment === "dev") {
    console.log("[DEV] Avo Inspector Event:", event);
  }
  avoInspector.trackSchemaFromEvent(event.eventName, event.eventProperties);
};

module.exports.convertXdmToEvent = convertXdmToEvent;
