# Client JS SDK Documentation

## Overview

The ServiceM8 Client JS SDK enables server-side add-ons to interact with the ServiceM8 platform after rendering. The SDK provides client-side JavaScript capabilities for popup window management and server communication.

## Installation

Include the SDK in your add-on's HTML `<head>` element:

```html
<head>
  <script src="https://platform.servicem8.com/sdk/1.0/sdk.js"></script>
</head>
```

Initialize the SDK immediately after inclusion:

```html
<script type="text/javascript">
  var client = SMClient.init();
</script>
```

The SDK has no external dependencies and integrates well with libraries like jQuery.

## Core Features

### Resizing Popup Windows

Adjust popup dimensions for Job actions, Client actions, and similar contexts.

**Method:**
```javascript
client.resizeWindow(width, height);
```

**Parameters:**
- `width`: Popup window width in pixels
- `height`: Popup window height in pixels

**Returns:** Promise object

**Example:**
```javascript
var client = SMClient.init();
client.resizeWindow(450, 600).then(function(result) {
    console.log("Add-on Window Resized");
});
```

### Closing Popup Windows

Close or destroy popup windows launched by add-on events.

**Method:**
```javascript
client.closeWindow();
```

**Returns:** Promise object

**Example:**
```javascript
var client = SMClient.init();
client.closeWindow();
```

### Invoking Server-Side Events

Pass requests from the client back to your server-side function or web service for additional processing or content refresh.

**Method:**
```javascript
client.invoke(eventName, eventParams);
```

**Parameters:**
- `eventName`: The server-side event to trigger
- `eventParams`: Object containing key-value pairs to pass server-side

**Returns:** Promise object

**Example:**
```javascript
var client = SMClient.init();
client.invoke("Add-on_Custom_event_here", {
    'emailTo': 'test@example.com'
}).then(function(result) {
    console.log("Server-side event invoked with result " + result);
});
```

---

**Last Updated:** 9 months ago
