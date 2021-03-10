'use strict';

const Homey = require('homey');
const retrieveWeerliveData = require('./assets/weerlive');

class KNMI extends Homey.App {

  onInit() {
    const receivedNewDataTrigger = this.homey.flow.getTriggerCard('received-new-data');

    const fetchNewData = this.homey.flow.getActionCard('fetch-new-data');
    fetchNewData.registerRunListener(async (args, state) => {
      const lat = this.homey.geolocation.getLatitude();
      const lon = this.homey.geolocation.getLongitude();
      const key = this.homey.settings.get('weerlive_api_key');

      return retrieveWeerliveData(lat, lon, key).then(tokens => {
        receivedNewDataTrigger.trigger(tokens);
      });
    });
  }

}

module.exports = KNMI;
