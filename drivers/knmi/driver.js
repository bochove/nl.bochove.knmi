'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class KNMIDriver extends Homey.Driver {

  onInit() {
    this.log('MyDriver has been inited');
  }

  async onPairListDevices() {
    this.log('listed devices');
    return [{
      name: 'KNMI weather',
      data: {
        id: 'HomeyLocation',
      },
    }];
  }

  async onPair(socket) {
    this.log(socket);

    // create the devices data property.

    const key = this.homey.settings.get('weerlive_api_key');
    if (!key) {
      socket.emit('errors', 'NO API key provided, go to general settings to change.', () => {
      });
      return;
    }

    const lat = this.homey.geolocation.getLatitude();
    const lon = this.homey.geolocation.getLongitude();
    fetch(`http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${lat},${lon}`)
      .then(res => res.json()).then(() => {
        this.log('validated api key, continue');
        setTimeout(() => {
          socket.emit('continue', null);
        }, 500);
      }).catch(err => {
        this.log(err);
        socket.emit('errors', 'No valid response from weerlive, check your API key', () => {
        });
      });
  }

}

module.exports = KNMIDriver;
