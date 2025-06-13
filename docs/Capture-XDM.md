# 🎯 XDM (Experience Data Model) Integration Guide

The Avo Inspector extension supports **Adobe Experience Platform Web SDK** with **XDM (Experience Data Model)** schemas. This allows you to validate XDM event schemas in near real-time as they're sent through the Adobe Web SDK.

## What is XDM Integration?

- **Captures XDM events** as they're sent to Adobe Experience Platform
- **Extracts schema structure** from XDM payloads
- **Automatically handles tenant-specific custom properties**
- **Supports flexible tenant property paths** for complex data structures
- **Validates XDM schema consistency** through Avo Inspector dashboard

---

## Prerequisites for XDM

Before setting up XDM integration, ensure you have:

- **Adobe Experience Platform Web SDK** extension installed in Adobe Tags
- **XDM Schema** configured in Adobe Experience Platform
- **Tenant ID** (your organization's custom namespace identifier)
- **Avo Inspector extension** installed and configured in Adobe Tags

---

## Step-by-Step XDM Setup

### 1️⃣ Configure Adobe Web SDK Extension (beforeSend)

In your **Adobe Experience Platform Web SDK** extension configuration, add this code to the **beforeSend** callback:

![Adobe Web SDK beforeSend Configuration](/public/images/xdm/websdk-before-send.png)

```javascript
// Modify content.xdm or content.data as necessary. There is no need to wrap the
// code in a function or return a value. For example:
// content.xdm.web.webPageDetails.name = "Checkout";

if (content?.xdm) {
  console.log("Dispatching to inspector listener", content);
  document.dispatchEvent(
    new CustomEvent("xdmEventToInspector", {
      detail: {
        xdmData: content.xdm,
        xdm: content.xdm, // Include both for backward compatibility
        data: content.data, // Include data for tenant path support
      },
    })
  );
} else {
  console.log("content.xdm does not exist", content);
}
```

**What this code does:**

- **Captures XDM data** as it's being sent to Adobe Experience Platform
- **Dispatches a custom DOM event** that the Avo Inspector can listen for
- **Preserves original XDM data** - doesn't modify the data being sent to Adobe
- **Provides full event structure** for tenant path support
- **Logs helpful debug information** for troubleshooting

### 2️⃣ Create XDM Rule in Adobe Tags

Create a new rule specifically for XDM event processing:

![XDM Rule Configuration](/public/images/xdm/xdm-rule-setup.png)

#### Event Configuration:

1. Go to **Rules** → Create a **new rule** (e.g., "XDM to Avo Inspector")
2. Click **Add Event** → Select **Avo Inspector** extension
3. Choose **"XDM Event to Inspector Listener"** as the event type
4. Click **Save**

#### Action Configuration:

1. Add an **Action** → Select **Avo Inspector** extension
2. Choose **"Handle XDM Event"** as the action type
3. Configure your XDM settings (see next step)

### 3️⃣ Configure XDM Data Extraction

Configure how XDM data should be processed and sent to Avo Inspector:

![XDM Configuration Interface](/public/images/xdm/xdm-configuration-interface.png)

#### Tenant Configuration:

- **Tenant ID (Required)**: Your Adobe tenant ID, typically starts with an underscore (e.g., `_yourcompany`)

  - This is used as a fallback if the tenant path doesn't yield results
  - Found in your XDM data structure as a top-level object key
  - Example: If your XDM has `"_yourcompany": {...}`, then `_yourcompany` is your tenant ID

- **Tenant Path (Optional)**: Path to your tenant object in the event structure
  - If provided, this path will be used first to find tenant properties
  - If not found, falls back to using the Tenant ID
  - Examples:
    - `detail.xdm._tenantId` - For tenant data in XDM
    - `detail.data._tenantId` - For tenant data in the data object
    - `detail.xdmData._tenantId` - For tenant data in xdmData

#### XDM Fields to Extract:

- Select which **standard XDM fields** should be included
- Common fields include: `device`, `environment`, `web`, `placeContext`, `timestamp`, `implementationDetails`
- **Note:** Custom tenant properties are handled automatically and don't need to be listed here

#### Field Configuration Examples:

**Standard XDM Fields (commonly used):**

- `device` - Device information (screen size, type, etc.)
- `environment` - Browser and environment details
- `web` - Web-specific data (page details, referrer, etc.)
- `placeContext` - Geographic and location data
- `timestamp` - Event timestamp
- `implementationDetails` - SDK implementation info

**Advanced XDM Fields:**

- `commerce` - E-commerce related data
- `marketing` - Marketing campaign information
- `search` - Search-related data
- `identityMap` - Identity information

---

## XDM-Specific Troubleshooting

### XDM Events Not Being Captured?

✔️ **Check Web SDK beforeSend configuration** - ensure the custom event dispatch code is properly added:

```javascript
// This should be in your Web SDK beforeSend callback
if (content?.xdm) {
  document.dispatchEvent(
    new CustomEvent("xdmEventToInspector", {
      detail: {
        xdmData: content.xdm,
        xdm: content.xdm,
        data: content.data,
      },
    })
  );
}
```

✔️ **Verify XDM rule is active** - check that your XDM rule is published and active in Adobe Tags.

✔️ **Test XDM data structure** - ensure your XDM data has an `eventType` field:

```javascript
// XDM data should include eventType
{
  "eventType": "web.webpagedetails.pageViews", // ← Required
  "web": { ... },
  "_yourtenant": { ... }
}
```

✔️ **Check tenant configuration** - verify your tenant ID and path match your XDM schema structure.

✔️ **Look for console logs** - the extension logs XDM processing details when environment is set to `dev`:

```
"Dispatching to inspector listener" // From Web SDK beforeSend
"logging payload" // From XDM action
"Executing onXdmEvent action with payload:" // From XDM action
"XDM FIELDS TO INCLUDE" // From XDM action
"[DEV] Avo Inspector Event:" // Final processed event
```

### XDM Fields Not Being Extracted?

✔️ **Check field configuration** - ensure the XDM fields you want are listed in the action configuration.

✔️ **Verify field names** - XDM field names are case-sensitive and must match exactly.

✔️ **Tenant properties missing?** - Remember that tenant properties are extracted automatically; they don't need to be in the XDM fields list.

### Common XDM Issues:

**Issue: eventType is undefined**

- Solution: Ensure your XDM schema includes an `eventType` field
- Alternative: Set `eventType` in your beforeSend callback if needed

**Issue: Tenant properties not appearing**

- Solution: Verify your tenant configuration:
  1. Check that your tenant ID matches your XDM namespace
  2. If using tenant path, verify the path exists in your event structure
  3. Look for your tenant namespace in the raw XDM data structure

**Issue: Missing standard XDM fields**

- Solution: Add the missing fields to your XDM fields configuration
- Check: Verify the field names match your actual XDM schema structure

---

## Advanced XDM Configuration

### Multiple Tenant IDs

If you have multiple tenant namespaces, you can configure additional processing in the beforeSend callback:

```javascript
if (content?.xdm) {
  // Handle multiple tenant IDs if needed
  const tenantData = {
    ...content.xdm._yourcompany,
    ...content.xdm._anothertenant,
  };

  document.dispatchEvent(
    new CustomEvent("xdmEventToInspector", {
      detail: {
        xdmData: {
          ...content.xdm,
          _yourcompany: tenantData,
        },
        xdm: content.xdm,
        data: content.data,
      },
    })
  );
}
```

### Conditional XDM Capture

You can add conditions to only capture specific types of XDM events:

```javascript
if (content?.xdm && content.xdm.eventType?.startsWith("web.")) {
  // Only capture web events
  document.dispatchEvent(
    new CustomEvent("xdmEventToInspector", {
      detail: {
        xdmData: content.xdm,
        xdm: content.xdm,
        data: content.data,
      },
    })
  );
}
```

---

## Testing Your XDM Integration

### 1. Test XDM Event Dispatch

Open your browser console and manually trigger an XDM event to test:

```javascript
// Test if your XDM integration is working
alloy("sendEvent", {
  xdm: {
    eventType: "web.webpagedetails.pageViews",
    web: {
      webPageDetails: {
        name: "Test Page",
      },
    },
    _yourcompany: {
      testProperty: "test value",
    },
  },
});
```

### 2. Verify Console Logs

Look for these log messages in your browser console:

1. `"Dispatching to inspector listener"` - From Web SDK beforeSend
2. `"logging payload"` - From XDM action
3. `"[DEV] Avo Inspector Event:"` - Final processed event

### 3. Check Network Requests

Monitor network requests to `https://api.avo.app/inspector/v1/track` to see the data being sent to Avo Inspector.

---

## Next Steps

Once your XDM integration is working:

1. **Monitor schema changes** in Avo Inspector dashboard
2. **Set up alerts** for schema violations
3. **Create tracking plan** in Avo to formalize your XDM schema expectations
4. **Train your team** on XDM schema best practices

For additional support, refer to the [main troubleshooting guide](../README.md#troubleshooting) or contact [Avo Support](https://www.avo.app).
