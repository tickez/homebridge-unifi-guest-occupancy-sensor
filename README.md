# Unifi Guests Presence Sensor

![npm](https://img.shields.io/npm/dt/homebridge-unifi-guest-occupancy-sensor) ![npm](https://img.shields.io/npm/v/homebridge-unifi-guest-occupancy-sensor)

This simple homebridge plugin emulates a presence sensor which marks presence when a client is connected to a Unifi guest network

Standalone Unifi Controller
```javascript
"accessories": [
  {
    "name": "Guests are Present",
    "unifi": {
      "controller": "https://unifi-controller:8443",
      "username": "superadmin",
      "password": "password",
      "site": "default",
      "secure": false,
      "unifios": false
    },
    "interval": 180,  // polling interval in case websocket connection is lost
    "accessory": "UniFi Guest Occupancy Sensor"
  }
]
```
For UnifiOS based device (UDM, KC, etc.), use port 443 (default) and set unifios to "true".
```javascript
"accessories": [
  {
    "name": "Guests are Present",
    "unifi": {
      "controller": "https://unifi-controller",
      "username": "superadmin",
      "password": "password",
      "site": "default",
      "secure": false,
      "unifios": true
    },
    "interval": 180,  // polling interval in case websocket connection is lost
    "accessory": "UniFi Guest Occupancy Sensor"
  }
]
```

