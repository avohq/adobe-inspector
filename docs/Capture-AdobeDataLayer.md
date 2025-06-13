# 📊 Adobe Client Data Layer & Google Data Layer Integration Guide

The Avo Inspector extension monitors **Adobe Client Data Layer** and **Google Data Layer** changes by sending **only data schemas** (no personal data) to Avo Inspector. This helps you ensure data consistency and catch schema violations in real time.

## What is Data Layer Integration?

- **Watches data layer changes** in real-time
- **Filters events and properties** based on configured prefixes
- **Automatically extracts & sends schema structures** to Avo Inspector
- **Ensures tracking consistency** without exposing user data

---

## Supported Data Layers

- **Adobe Client Data Layer** (`window.adobeDataLayer`)
- **Google Data Layer** (`window.dataLayer`)

Both data layers can be configured to listen to "All Events" for comprehensive schema monitoring.

---

## Prerequisites

Before setting up data layer integration, ensure you have:

- **Adobe Client Data Layer Extension** or **Google Data Layer Extension** installed in Adobe Tags
- **Avo Inspector extension** installed and configured in Adobe Tags
- **Data layer implemented** on your website

---

## Step-by-Step Data Layer Setup

### 1️⃣ Configure the Event

Create a rule to listen for data layer changes:

![Adobe Create Rule](/public/images/create-rule.png)

**Event Setup:**

1. Go to **Rules** → Create a **new rule**
2. Click **Add Event** → Select the appropriate data layer extension:
   - **Adobe Client Data Layer** extension, or
   - **Google Data Layer** extension
3. Under eventType select **"Data Pushed"**
4. In the settings, select:
   - **Listen to: "All Events"**
   - **Time Scope: "Future"**
5. Click **Save**

![Adobe Data Layer Configuration](/public/images/event-configuration.png)

### 2️⃣ Configure the Action

Add the Avo Inspector action to process data layer events:

![Adobe Action Configuration](/public/images/action-configuration.png)

**Action Setup:**

1. Add an **Action** → Select **Avo Inspector** extension
2. Choose **"Data Layer Push"** as the action type
3. Configure filtering options (see next section)

### 3️⃣ Configure Event & Property Filtering

Configure which events and properties should be filtered out:

| Setting                 | Description                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| **Event Name Prefixes** | Filters out events that start with specific prefixes                                           |
| **Property Prefixes**   | Filters out properties that start with specific prefixes (only works for top level properties) |

**Default Filter Settings:**

**Event Name Prefixes (commonly filtered):**

- `gtm.` - Google Tag Manager system events
- `GoogleTagManager.` - Additional GTM events
- `adobe.` - Adobe system events
- `event.` - Generic event prefixes

**Property Prefixes (commonly filtered):**

- `gtm.` - Google Tag Manager properties
- `GoogleTagManager.` - Additional GTM properties
- `event.` - Event-specific properties
- `timestamp` - System timestamps
- `time` - Time-related properties
- `xdm.` - XDM system properties
- `queryParams.` - URL query parameters

### 4️⃣ Save and Publish

1. Click **Save Rule**
2. **Publish your changes** in Adobe Tags
3. Once live, the extension will start **tracking schemas automatically**

---

## How Data Layer Processing Works

### 1️⃣ Event & Property Filtering

- The extension **listens** for changes in the configured data layer
- Events and properties are filtered based on **prefix rules** (configured in settings)
- Unwanted prefixes are ignored, while **only schema structures** are processed

### 2️⃣ Sending Schemas to Avo Inspector

- Once an event passes the filter, the extension **extracts its schema** and sends it to Avo Inspector
- The schema is structured according to Avo's **schema validation**
- This helps identify **tracking inconsistencies** in real time

### 3️⃣ Example: What We Send

#### Incoming Adobe Client Data Layer Event:

```js
adobeDataLayer.push({
  event: "signup_start",
  platform: "Web",
  referral: "direct",
  user: {
    id: 1235,
    email: "john@doe.com",
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    age: 25,
    country: "United States",
    city: "New York",
  },
});
```

#### Filtered & Sent to Avo Inspector (Only Schema, No Data):

```json
{
  "eventName": "signup_start",
  "eventProperties": {
    "platform": "string",
    "referral": "string",
    "user": {
      "id": "int",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "gender": "string",
      "age": "int",
      "country": "string",
      "city": "string"
    }
  }
}
```

#### Incoming Google Data Layer Event:

```js
dataLayer.push({
  event: "signup_start",
  platform: "iOS",
  referral: "friend123",
  user: {
    id: 1235,
    email: "john@doe.com",
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    age: 25,
    country: "United States",
    city: "New York",
  },
});
```

#### Filtered & Sent to Avo Inspector (Only Schema, No Data):

```json
{
  "eventName": "signup_start",
  "eventProperties": {
    "message_id": "string", // GTM specific properties
    "message_type": "string", // GTM specific properties
    "platform": "string",
    "referral": "string",
    "userId": "string", // GTM specific user id
    "user": {
      "id": "int",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "gender": "string",
      "age": "int",
      "country": "string",
      "city": "string"
    }
  }
}
```

**Note:** GTM-specific properties will be included in the eventProperties but can be filtered out in the configuration.

---

## Key Benefits of Data Layer Integration

✅ **Real-time schema monitoring** of your data layer events  
✅ **Automatic filtering** of system-generated noise  
✅ **Schema consistency validation** across your tracking implementation  
✅ **No PII sent** - only schema structures are transmitted  
✅ **Supports multiple data layers** - Adobe and Google  
✅ **Easy configuration** with prefix-based filtering

---

## Data Layer-Specific Troubleshooting

### No Schemas Being Sent?

✔️ **Check if the data layer has events** in the browser console:

**For Adobe Client Data Layer:**

```js
window.adobeDataLayer.push({ event: "test.event" });
```

**For Google Data Layer:**

```js
window.dataLayer.push({ event: "test.event" });
```

✔️ **Ensure event prefixes are not blocking schema extraction** - check your filter configuration.

✔️ **Verify the data layer extension is working** - check that events are being captured in Adobe Tags.

### Getting Errors in Avo Inspector?

✔️ **Validate the schema** in Avo Inspector  
✔️ **Check the API key and environment settings**  
✔️ **Look at network requests** (`F12 → Network`) to see what's being sent  
✔️ **The Extension logs to console** if the environment is set to `dev`

### Common Data Layer Issues:

**Issue: Too many system events being sent**

- Solution: Add more event name prefixes to filter out unwanted events
- Check: Review the events in your data layer and identify patterns to filter

**Issue: Missing important properties**

- Solution: Review your property prefix filters - you might be filtering too aggressively
- Check: Ensure important business properties aren't being filtered out

**Issue: Data layer events not triggering**

- Solution: Verify the data layer extension is properly configured
- Check: Ensure "Listen to: All Events" is selected in your rule configuration

---

## Advanced Data Layer Configuration

### Custom Event Filtering

You can create more sophisticated filtering by modifying the extension settings:

**Example: Only capture specific event types**

```
Event Name Prefixes to Filter:
- gtm.
- adobe.
- system.
- debug.
```

**Example: Preserve important system properties**

```
Property Prefixes to Filter:
- gtm.
- event.
- timestamp  (but not timestampUTC)
- temp.
```

### Multiple Data Layer Support

You can set up multiple rules for different data layers:

1. **Rule 1:** Adobe Client Data Layer → Avo Inspector
2. **Rule 2:** Google Data Layer → Avo Inspector
3. **Rule 3:** Custom Data Layer → Avo Inspector

Each rule can have different filtering configurations based on your needs.

### Environment-Specific Filtering

Consider different filtering rules for different environments:

**Development Environment:**

- Less aggressive filtering to catch more potential issues
- More verbose logging

**Production Environment:**

- More aggressive filtering to reduce noise
- Essential events and properties only

---

## Testing Your Data Layer Integration

### 1. Test Data Layer Events

**Adobe Client Data Layer:**

```javascript
// Test Adobe Client Data Layer
window.adobeDataLayer = window.adobeDataLayer || [];
window.adobeDataLayer.push({
  event: "test_event",
  testProperty: "test_value",
  testObject: {
    nestedProperty: "nested_value",
  },
});
```

**Google Data Layer:**

```javascript
// Test Google Data Layer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "test_event",
  testProperty: "test_value",
  testObject: {
    nestedProperty: "nested_value",
  },
});
```

### 2. Verify Console Logs

Look for these log messages in your browser console (when environment is set to `dev`):

1. `"[Avo Inspector] Context:"` - Shows the rule context
2. `"[Avo Inspector] Event:"` - Shows the processed event
3. `"[Avo Inspector] Skipping Adobe system event:"` - Shows filtered events
4. `"Sending event to Avo Inspector"` - Shows successful transmission

### 3. Monitor Network Requests

Check network requests to `https://api.avo.app/inspector/v1/track` to see the schema data being sent.

### 4. Test Filtering

Verify your filtering is working by:

1. Pushing events that should be filtered out
2. Checking that they don't appear in console logs or network requests
3. Pushing events that should pass through
4. Verifying they appear in Avo Inspector

---

## Best Practices

### Filtering Strategy

1. **Start conservative** - filter out obvious system events first
2. **Monitor for noise** - add filters for events that create too much noise
3. **Preserve business logic** - ensure important tracking events aren't filtered
4. **Regular review** - periodically review and update your filters

### Performance Considerations

1. **Use specific prefixes** - more specific filters perform better
2. **Avoid over-filtering** - don't filter essential data
3. **Monitor impact** - watch for performance impact on your site

### Schema Management

1. **Document your schema** - maintain documentation of expected events
2. **Version control** - track changes to your filtering configuration
3. **Team alignment** - ensure your team understands the filtering rules

---

## Next Steps

Once your data layer integration is working:

1. **Monitor schema changes** in Avo Inspector dashboard
2. **Set up alerts** for schema violations
3. **Create tracking plan** in Avo to formalize your schema expectations
4. **Train your team** on data layer best practices
5. **Regular schema reviews** - schedule periodic reviews of your tracking implementation

For additional support, refer to the [main troubleshooting guide](../README.md#troubleshooting) or contact [Avo Support](https://www.avo.app).
