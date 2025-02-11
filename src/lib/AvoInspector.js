const AvoSchemaParser = require("./AvoSchemaParser");
const AvoNetworkCallsHandler = require("./AvoNetworkCallsHandler");

class AvoInspector {
  constructor(settings) {
    // Ensure settings is provided and contains the required fields

    // Initialize instance properties
    this.apiKey = settings.apiKey;
    this.environment = settings.environment || "dev";
    this.version = settings.version;

    this.networkCallsHandler = new AvoNetworkCallsHandler(
      this.apiKey,
      this.environment,
      settings.appName || "",
      this.version,
      "1.0.0" // Replace with the actual library version
    );
  }

  static enableLogging(enable) {
    AvoInspector._shouldLog = enable;
  }

  trackSchemaFromEvent(eventName, eventProperties) {
    try {
      const eventSchema = this.extractSchema(eventProperties, false);
      this.trackSchemaInternal(eventName, eventSchema, null, null);
      return eventSchema;
    } catch (error) {
      console.error("Avo Inspector: Error in trackSchemaFromEvent.", error);
      return [];
    }
  }

  trackSchemaInternal(eventName, eventSchema, eventId, eventHash) {
    try {
      // Directly send the event using AvoNetworkCallsHandler
      const eventBody = this.networkCallsHandler.bodyForEventSchemaCall(
        eventName,
        eventSchema,
        eventId,
        eventHash
      );

      this.networkCallsHandler.callInspectorWithBatchBody(
        [eventBody], // Send a single event as a batch of one
        (error) => {
          if (error) {
            console.error("Avo Inspector: Failed to send event schema:", error);
          } else if (AvoInspector._shouldLog) {
            console.log("Avo Inspector: Event schema sent successfully.");
          }
        }
      );
    } catch (error) {
      console.error("Avo Inspector: Error in trackSchemaInternal.", error);
    }
  }

  extractSchema(eventProperties, shouldLogIfEnabled = true) {
    try {
      return AvoSchemaParser.extractSchema(eventProperties);
    } catch (error) {
      console.error("Avo Inspector: Error in extractSchema.", error);
      return [];
    }
  }
}

module.exports = AvoInspector;
