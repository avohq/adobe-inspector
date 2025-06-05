# 📌 Avo Inspector Adobe Tags Extension

**Version:** `1.1.2`  
**Author:** [Avo](https://www.avo.app)  
**Platform:** Adobe Experience Platform Tags  
**License:** MIT

---

## 🚀 Overview

The **Avo Inspector Adobe Tags Extension** allows you to **monitor and validate** your data schemas by sending **only data structures** (no personal data) to Avo Inspector. This helps you ensure data consistency and catch schema violations in real time.

✅ **The integration does NOT send personal data to Avo Inspector; only the structures of the data is sent.**  
✅ This means your **user data remains secure** while allowing you to monitor the health of your tracking implementation.

#### [Avo documentation](https://www.avo.app/docs/inspector/connect-inspector-to-adobe-tag-extension)

---

## ✨ Features

✔️ **Monitors multiple data sources** - Adobe Client Data Layer, Google Data Layer, and XDM schemas  
✔️ **Intelligent filtering** - Remove noise from system-generated events and properties  
✔️ **Real-time schema validation** - Catch inconsistencies as they happen  
✔️ **Privacy-first** - Only schema structures are sent, never personal data  
✔️ **Easy setup** - Simple configuration through Adobe Tags interface

---

## 📥 Installation

1. **Go to _Adobe Experience Platform Tags_.**
2. **Navigate to the _Extensions_ catalog.**
3. **Search for _"Avo Inspector"_.**
4. Click **Install** and follow the setup instructions.

---

## 🛠 Configuration

Once installed, configure the extension in **Adobe Tags**:

### 🔧 Extension Configuration

These settings apply to the **Avo Inspector extension** globally across your Tags property.

| Setting         | Description                                                |
| --------------- | ---------------------------------------------------------- |
| **API Key**     | Your Avo Inspector API Key for authentication.             |
| **Environment** | Defines the environment (dev, staging, prod).              |
| **App Version** | The application version being tracked. (defaults to 1.0.0) |

### 📊 Supported Data Sources

The extension supports multiple data sources, each with its own setup guide:

#### [Adobe Client Data Layer & Google Data Layer Integration](docs/Capture-AdobeDataLayer.md)

- Monitor `window.adobeDataLayer` and `window.dataLayer` changes
- Filter out system-generated noise with prefix-based rules
- Real-time schema validation for traditional data layer implementations

#### [XDM (Experience Data Model) Integration](docs/Capture-XDM.md)

- Capture XDM schemas from Adobe Experience Platform Web SDK
- Automatic tenant property extraction and promotion
- Real-time validation before data reaches Adobe Experience Platform

---

## 🔍 Troubleshooting

### 1️⃣ No Schemas Being Sent?

✔️ **Check your data source** - verify events are being generated:

```js
// For Adobe Client Data Layer
window.adobeDataLayer.push({ event: "test.event" });

// For Google Data Layer
window.dataLayer.push({ event: "test.event" });
```

✔️ **Check filtering configuration** - ensure your prefix filters aren't too aggressive.

### 2️⃣ Getting Errors in Avo Inspector?

✔️ **Validate API key and environment settings**  
✔️ **Check network requests** (`F12 → Network`) to see what's being sent  
✔️ **Enable debug logging** by setting environment to `dev`

### 3️⃣ Need More Help?

For detailed troubleshooting guides specific to your integration type:

- [Adobe/Google Data Layer Troubleshooting](docs/Capture-AdobeDataLayer.md#data-layer-specific-troubleshooting)
- [XDM Integration Troubleshooting](docs/Capture-XDM.md#xdm-specific-troubleshooting)

---

## 🚀 Updating the Extension

To upgrade to a newer version:

1. **Go to Adobe Tags** → Extensions.
2. **Find "Avo Inspector"** → Click **Upgrade**.
3. Publish changes and **test in a development environment first**.

---

## 📞 Support

For any questions, reach out to [Avo Support](https://www.avo.app) or check our [documentation](https://github.com/avohq/adobe-inspector#readme).

---

### 📢 Ready to Validate Your Data Schemas?

🔹 Install **Avo Inspector for Adobe Tags** today and **monitor your tracking schemas in real time!** 🚀
