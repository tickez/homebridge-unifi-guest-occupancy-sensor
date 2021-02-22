'use strict';

const UnifiEvents = require('unifi-events');
const manifest = require('./package.json');
const url = require("url");

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
    this.exclude = config.exclude || [];

    this.controller=url.parse(config.unifi.controller);

    log(`${this.controller.hostname}, ${this.controller.port}`);

    this.unifi = new UnifiEvents({
      host: this.controller.hostname,
      port: this.controller.port || 443,
      username: config.unifi.username,
      password: config.unifi.password,
      site: config.unifi.site || 'default',
      insecure: !config.unifi.secure || true,
      unifios: config.unifi.unifios || false
    });

    this.unifi.on('*.connected', (data) => {
      return this.checkOccupancy()
    });

    this.unifi.on('*.disconnected', (data) => {
      return this.checkOccupancy()
    });

    this.occupancyDetected = Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
    this.checkOccupancy();
    setInterval(this.checkOccupancy.bind(this), this.interval * 1000)
  }

  checkOccupancy() {
    const guestIsPresent = (device) => device.is_guest === true && !this.exclude.includes(device.mac);
    this.unifi.get('stat/sta').then((res) => {
      if (res.data.some(guestIsPresent)) {
        this.log("Guests are present");
        this.occupancyDetected = Characteristic.OccupancyDetected.OCCUPANCY_DETECTED;
      } else {
        this.log("No guests are present");
        this.occupancyDetected = Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
      }
      this.setOccupancyDetected(this.occupancyDetected);
    })
    .catch((err) => {
      this.log(`ERROR: Failed to check occupancy: ${err}`)
    });
  }

  getOccupancyDetected(callback) {
    return callback(null, this.occupancyDetected)
  }

  setOccupancyDetected(value) {
    return this.occupancyService.setCharacteristic(Characteristic.OccupancyDetected, value)
  }

  getServices() {
    var informationService = new Service.AccessoryInformation()
    .setCharacteristic(Characteristic.Manufacturer, 'Unifi')
    .setCharacteristic(Characteristic.Model, 'unifi-guest-occupancy')
    .setCharacteristic(Characteristic.SerialNumber, manifest.version);

    this.occupancyService
    .getCharacteristic(Characteristic.OccupancyDetected)
    .on('get', this.getOccupancyDetected.bind(this));

    return [informationService, this.occupancyService]
  }
}
