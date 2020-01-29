'use strict';

const UnifiEvents = require('unifi-events');

let Service, Characteristic;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-unifi-guest-occupancy-sensor', 'UniFi Guest Occupancy Sensor', OccupancySensor)
};

class OccupancySensor {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.occupancyService = new Service.OccupancySensor(this.name);
    this.guestNetworks = config.guestNetworks || [];
    this.interval = config.interval || 180;

    this.unifi = new UnifiEvents({
      controller: config.unifi.controller,
      username: config.unifi.username,
      password: config.unifi.password,
      site: config.unifi.site || 'default',
      rejectUnauthorized: config.unifi.secure || false,
      listen: true
    });

    this.unifi.on('connected', (data) => {
      return this.checkOccupancy()
    });

    this.unifi.on('disconnected', (data) => {
      return this.checkOccupancy()
    });

    this.occupancyDetected = Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
    this.checkOccupancy();
    setInterval(this.checkOccupancy.bind(this), this.interval * 1000)
  }

  checkOccupancy() {
    const guestIsPresent = (device) => device.is_guest === true;
    this.unifi.getClients().then((res) => {
      if (res.data.some(guestIsPresent)) {
        this.setOccupancyDetected(true);
      } else {
        this.setOccupancyDetected(false);
      }
    })
    .catch((err) => {
      this.log(`ERROR: Failed to check occupancy: ${err.message}`)
    });
  }

  getOccupancyDetected(callback) {
    return callback(null, this.checkOccupancy())
  }

  setOccupancyDetected(value) {
    return this.occupancyService.setCharacteristic(Characteristic.OccupancyDetected, value)
  }

  getServices() {
    var informationService = new Service.AccessoryInformation()
    .setCharacteristic(Characteristic.Manufacturer, 'Unifi')
    .setCharacteristic(Characteristic.Model, 'unifi-guest-occupancy')

    this.occupancyService
    .getCharacteristic(Characteristic.OccupancyDetected)
    .on('get', this.getOccupancyDetected.bind(this));

    return [informationService, this.occupancyService]
  }
}
