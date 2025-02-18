# 📌 Avo Inspector Adobe Launch Extension

**Version:** `1.0.0`  
**Author:** [Avo](https://www.avo.app)  
**Platform:** Adobe Experience Platform Launch  
**License:** MIT

---

## 🚀 Overview

The **Avo Inspector Adobe Launch Extension** allows you to **monitor and validate** your **Adobe Client Data Layer** by sending **only data schemas** (no personal data) to Avo Inspector. This helps you ensure data consistency and catch schema violations in real time.

✅ **The integration does NOT send personal data to Avo Inspector; only the structures of the data is sent.**  
✅ This means your **user data remains secure** while allowing you to monitor the health of your tracking implementation.

---

## ✨ Features

✔️ **Watches the Adobe Client Data Layer for changes**  
✔️ **Filters events and properties based on configured prefixes**  
✔️ **Automatically extracts & sends schema structures to Avo Inspector**  
✔️ **Ensures tracking consistency without exposing user data**

---

## 📥 Installation

1. **Go to _Adobe Experience Platform Launch_.**
2. **Navigate to the _Extensions_ catalog.**
3. **Search for _"Avo Inspector"_.**
4. Click **Install** and follow the setup instructions.

---

## 🛠 Configuration

Once installed, you can configure the extension in **Adobe Launch**:

### 🔧 Extension Configuration

These settings apply to the **Avo Inspector extension** globally across your Launch property.

| Setting         | Description                                    |
| --------------- | ---------------------------------------------- |
| **API Key**     | Your Avo Inspector API Key for authentication. |
| **Environment** | Defines the environment (dev, staging, prod).  |
| **App Version** | The application version being tracked.         |

### 🔧 Rule-Specific Configuration

These settings apply to individual **rules** where the extension is used.

| Setting                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| **Event Name Prefixes** | Filters out events that start with specific prefixes.     |
| **Property Prefixes**   | Filters out properties that start with specific prefixes. |

---

## 🔗 Setting Up a Rule in Adobe Launch

To track schemas, you need to configure a **rule** in Adobe Launch:

### 1️⃣ Configure the Event

- Go to **Rules** → Create a **new rule**.
- Click **Add Event** → Select `watchAdobeClientDataLayer`.
- Configure it to watch for relevant data layer changes.

### 2️⃣ Configure the Action

- Add an **Action** → Select **Avo Inspector**.
- Choose `onAdobeClientDataLayer` as the action type.
- Configure the **Rule-Specific Configuration** (Event Name Prefixes & Property Prefixes).

### 3️⃣ Save and Publish

- Click **Save Rule**.
- Publish your changes in Adobe Launch.
- Once live, the extension will start **tracking schemas automatically**.

---

## 📊 How It Works

### 1️⃣ Event & Property Filtering

- The extension **listens** for changes in the Adobe Client Data Layer.
- Events and properties are filtered based on **prefix rules** (configured in settings).
- Unwanted prefixes are ignored, while **only schema structures** are processed.

### 2️⃣ Sending Schemas to Avo Inspector

- Once an event passes the filter, the extension **extracts its schema** and sends it to Avo Inspector.
- The schema is structured according to Avo’s **schema validation**.
- This helps identify **tracking inconsistencies** in real time.

### 3️⃣ Example: What We Send

#### Incoming Adobe Client Data Layer Event:

```json
{
  "eventName": "adobe.user.login",
  "eventProperties": {
    "xdm.userId": "12345",
    "queryParams.source": "web",
    "timestamp": "2024-02-11T12:34:56Z"
  }
}
```

#### Filtered & Sent to Avo Inspector (Only Schema, No Data):

```json
{
  "eventName": "user.login",
  "eventProperties": {
    "userId": "string",
    "source": "string"
  }
}
```

✔️ **We remove values and only send the schema (keys and data types).**  
✔️ **No personally identifiable information (PII) is ever sent.**

## 🔍 Troubleshooting

### 1️⃣ No Schemas Being Sent?

✔️ Check if the Adobe Data Layer has events in the browser console:

```js
window.adobeDataLayer.push({ event: "test.event" });
```

✔️ Ensure **event prefixes are not blocking schema extraction**.

### 2️⃣ Getting Errors in Avo Inspector?

✔️ Validate the **schema** in Avo Inspector.  
✔️ Check the **API key and environment settings**.  
✔️ Look at **network requests** (`F12 → Network`) to see what’s being sent.

---

## 🚀 Updating the Extension

To upgrade to a newer version:

1. **Go to Adobe Launch** → Extensions.
2. **Find "Avo Inspector"** → Click **Upgrade**.
3. Publish changes and **test in a development environment first**.

---

## 📞 Support

For any questions, reach out to [Avo Support](https://www.avo.app) or check our [documentation](https://github.com/avohq/adobe-inspector#readme).

---

### 📢 Ready to Validate Your Data Schemas?

🔹 Install **Avo Inspector for Adobe Launch** today and **monitor your tracking schemas in real time!** 🚀
