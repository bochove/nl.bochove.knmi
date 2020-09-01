'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class KNMIDevice extends Homey.Device {

  onInit() {
    this.log('MyDevice has been inited');
    this.refresh();
  }

  refresh() {
    setTimeout(this.refresh, (10 * 60 * 1000)); // refresh is repeated after 10 minutes

    const lat = this.homey.geolocation.getLatitude();
    const lon = this.homey.geolocation.getLongitude();
    const key = this.homey.settings.get('weerlive_api_key');
    return fetch(`http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${lat},${lon}`)
      .then(res => res.json()).then(res => {
        if (res.liveweer && Array.isArray(res.liveweer) && res.liveweer.length === 1) {
          res = res.liveweer[0];
        }

        this.setCapability('city', res.plaats ? res.plaats : '');
        this.setCapability('currentTemp', parseFloat(res.temp) ? parseFloat(res.temp) : 0);
        this.setCapability('feelTemp', parseFloat(res.gtemp) ? parseFloat(res.gtemp) : 0);
        this.setCapability('recap', res.samenv ? res.samenv : '');
        this.setCapability('humidity', parseFloat(res.lv) ? parseFloat(res.lv) : 0);
        this.setCapability('windDirection', res.windr ? res.windr : '');
        this.setCapability('windSpeedMS', parseFloat(res.windms) ? parseFloat(res.windms) : 0);
        this.setCapability('windForce', parseFloat(res.windk) ? parseFloat(res.windk) : 0);
        this.setCapability('windSpeedKMH', parseFloat(res.windkmh) ? parseFloat(res.windkmh) : 0);
        this.setCapability('airPressure', parseFloat(res.luchtd) ? parseFloat(res.luchtd) : 0);
        this.setCapability('airPressureMMHG', parseFloat(res.ldmmhg) ? parseFloat(res.ldmmhg) : 0);
        this.setCapability('dewPoint', parseFloat(res.dauwp) ? parseFloat(res.dauwp) : 0);
        this.setCapability('sight', parseFloat(res.zicht) ? parseFloat(res.zicht) : 0);
        this.setCapability('expected', res.verw ? res.verw : '');
        this.setCapability('sunUp', res.sup ? res.sup : '');
        this.setCapability('sunDown', res.sunder ? res.sunder : '');
        this.setCapability('expectedTodayRecap', res.d0weer ? res.d0weer : '');
        this.setCapability('expectedTodayMaxTemp', parseFloat(res.d0tmax) ? parseFloat(res.d0tmax) : 0);
        this.setCapability('expectedTodayMinTemp', parseFloat(res.d0tmin) ? parseFloat(res.d0tmin) : 0);
        this.setCapability('expectedTodayWindForce', parseFloat(res.d0windk) ? parseFloat(res.d0windk) : 0);
        this.setCapability('expectedTodayWindSpeedMS', parseFloat(res.d0windms) ? parseFloat(res.d0windms) : 0);
        this.setCapability('expectedTodayWindSpeedKMH', parseFloat(res.d0windkmh) ? parseFloat(res.d0windkmh) : 0);
        this.setCapability('expectedTodayWindDirection', res.d0windr ? res.d0windr : '');
        this.setCapability('expectedTodayPrecipitation', parseFloat(res.d0neerslag) ? parseFloat(res.d0neerslag) : 0);
        this.setCapability('expectedTodaySunshine', parseFloat(res.d0zon) ? parseFloat(res.d0zon) : 0);
        this.setCapability('expectedTomorrowRecap', res.d1weer ? res.d1weer : '');
        this.setCapability('expectedTomorrowMaxTemp', parseFloat(res.d1tmax) ? parseFloat(res.d1tmax) : 0);
        this.setCapability('expectedTomorrowMinTemp', parseFloat(res.d1tmin) ? parseFloat(res.d1tmin) : 0);
        this.setCapability('expectedTomorrowWindForce', parseFloat(res.d1windk) ? parseFloat(res.d1windk) : 0);
        this.setCapability('expectedTomorrowWindSpeedMS', parseFloat(res.d1windms) ? parseFloat(res.d1windms) : 0);
        this.setCapability('expectedTomorrowWindSpeedKMH', parseFloat(res.d1windkmh) ? parseFloat(res.d1windkmh) : 0);
        this.setCapability('expectedTomorrowWindDirection', res.d1windr ? res.d1windr : '');
        this.setCapability('expectedTomorrowPrecipitation', parseFloat(res.d1neerslag) ? parseFloat(res.d1neerslag) : 0);
        this.setCapability('expectedTomorrowSunshine', parseFloat(res.d1zon) ? parseFloat(res.d1zon) : 0);
        this.setCapability('expectedDayAfterTomorrowRecap', res.d2weer ? res.d2weer : '');
        this.setCapability('expectedDayAfterTomorrowMaxTemp', parseFloat(res.d2tmax) ? parseFloat(res.d2tmax) : 0);
        this.setCapability('expectedDayAfterTomorrowMinTemp', parseFloat(res.d2tmin) ? parseFloat(res.d2tmin) : 0);
        this.setCapability('expectedDayAfterTomorrowWindForce', parseFloat(res.d2windk) ? parseFloat(res.d2windk) : 0);
        this.setCapability('expectedDayAfterTomorrowWindSpeedMS', parseFloat(res.d2windms) ? parseFloat(res.d2windms) : 0);
        this.setCapability('expectedDayAfterTomorrowWindSpeedKMH', parseFloat(res.d2windkmh) ? parseFloat(res.d2windkmh) : 0);
        this.setCapability('expectedDayAfterTomorrowWindDirection', res.d2windr ? res.d2windr : '');
        this.setCapability('expectedDayAfterTomorrowPrecipitation', parseFloat(res.d2neerslag) ? parseFloat(res.d2neerslag) : 0);
        this.setCapability('expectedDayAfterTomorrowSunshine', parseFloat(res.d2zon) ? parseFloat(res.d2zon) : 0);
        this.setCapability('currentWeatherAlarm', res.alarm ? res.alarm : '');
      }).catch(err => {
        this.log(err);
      });
  }

  setCapability(capability, value) {
    if (this.hasCapability(capability)) {
      const currentValue = this.getCapabilityValue(capability);
      if (currentValue !== value) {
        this.setCapabilityValue(capability, value).catch(err => this.log(`Could not set ${capability} to ${value}, of type ${typeof value}`, err));
      }
    } else {
      this.log(`Tried to set ${capability}, but no such capability found.`);
    }
  }

}

module.exports = KNMIDevice;
