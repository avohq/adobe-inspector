var AvoGuid = require("./AvoGuid");

function AvoNetworkCallsHandler(
  apiKey,
  envName,
  appName,
  appVersion,
  libVersion
) {
  this.apiKey = apiKey;
  this.envName = envName;
  this.appName = appName;
  this.appVersion = appVersion;
  this.libVersion = libVersion;
  this.samplingRate = 1.0;
  this.sending = false;
}

AvoNetworkCallsHandler.trackingEndpoint =
  "https://api.avo.app/inspector/v1/track";

AvoNetworkCallsHandler.prototype.callInspectorWithBatchBody = function (
  inEvents,
  onCompleted
) {
  if (this.sending) {
    onCompleted(
      "Batch sending cancelled because another batch sending is in progress. Your events will be sent with the next batch."
    );
    return;
  }

  var events = inEvents.filter(function (x) {
    return x != null;
  });

  if (events.length === 0) {
    return;
  }

  this.sending = true;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", AvoNetworkCallsHandler.trackingEndpoint, true);
  xmlhttp.setRequestHeader("Content-Type", "text/plain");
  xmlhttp.send(JSON.stringify(events));

  if (this.envName === "dev") {
    console.log("Sending event to Avo Inspector", events);
  }

  var self = this;
  xmlhttp.onload = function () {
    if (xmlhttp.status !== 200) {
      onCompleted("Error " + xmlhttp.status + ": " + xmlhttp.statusText);
    } else {
      var response = JSON.parse(xmlhttp.response);
      if (response.samplingRate !== undefined) {
        self.samplingRate = response.samplingRate;
      }
      if (self.envName === "dev") {
        console.log("Successfully sent event to Avo Inspector", events);
      }
      onCompleted(null);
    }
  };
  xmlhttp.onerror = function () {
    if (self.envName === "dev") {
      console.log("Error sending event to Avo Inspector", events);
    }
    onCompleted("Request failed");
  };
  xmlhttp.ontimeout = function () {
    if (self.envName === "dev") {
      console.log("Request timed out", events);
    }
    onCompleted("Request timed out");
  };
  this.sending = false;
};

AvoNetworkCallsHandler.prototype.bodyForSessionStartedCall = function () {
  var sessionBody = this.createBaseCallBody();
  sessionBody.type = "sessionStarted";
  return sessionBody;
};

AvoNetworkCallsHandler.prototype.bodyForEventSchemaCall = function (
  eventName,
  eventProperties,
  eventId,
  eventHash
) {
  var eventSchemaBody = this.createBaseCallBody();
  eventSchemaBody.type = "event";
  eventSchemaBody.eventName = eventName;
  eventSchemaBody.eventProperties = eventProperties;

  if (eventId != null) {
    eventSchemaBody.avoFunction = true;
    eventSchemaBody.eventId = eventId;
    eventSchemaBody.eventHash = eventHash;
  } else {
    eventSchemaBody.avoFunction = false;
    eventSchemaBody.eventId = null;
    eventSchemaBody.eventHash = null;
  }

  return eventSchemaBody;
};

AvoNetworkCallsHandler.prototype.createBaseCallBody = function () {
  return {
    apiKey: this.apiKey,
    appName: this.appName,
    appVersion: this.appVersion,
    libVersion: this.libVersion,
    env: this.envName,
    libPlatform: "web",
    messageId: AvoGuid.newGuid(),
    trackingId: "AdobeTagExtension",
    createdAt: new Date().toISOString(),
    sessionId: "",
    samplingRate: this.samplingRate,
  };
};

module.exports = AvoNetworkCallsHandler;
