# Unifi Guests Presence Sensor

![npm](https://img.shields.io/npm/dt/homebridge-unifi-guest-occupancy-sensor) ![npm](https://img.shields.io/npm/v/homebridge-unifi-guest-occupancy-sensor)

This simple homebridge plugin emulates a presence sensor which marks presence when a client is connected to a Unifi guest network

```javascript
"accessories": [
  {
    "name": "Guests are Present",
    "unifi": {
      "controller": "https://unifi-controller:8443",
      "username": "superadmin",
      "password": "password",
      "site": "default",
      "secure": false
    },
    "interval": 180,  // polling interval in case websocket connection is lost
    "accessory": "UniFi Guest Occupancy Sensor"
  }
]
```


