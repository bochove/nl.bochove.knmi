'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class KNMI extends Homey.App {

  onInit() {
    const receivedNewDataTrigger = this.homey.flow.getTriggerCard('received-new-data');

    const fetchNewData = this.homey.flow.getActionCard('fetch-new-data');
    fetchNewData.registerRunListener(async (args, state) => {
      const lat = this.homey.geolocation.getLatitude();
      const lon = this.homey.geolocation.getLongitude();
      const key = this.homey.settings.get('weerlive_api_key');
      return fetch(`http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${lat},${lon}`)
        .then(res => res.json()).then(res => {
          if (res.liveweer && Array.isArray(res.liveweer) && res.liveweer.length === 1) {
            res = res.liveweer[0];
          }
          const tokens = {
            city: res.plaats ? res.plaats : '',
            currentTemp: parseFloat(res.temp) ? parseFloat(res.temp) : 0,
            feelTemp: parseFloat(res.gtemp) ? parseFloat(res.gtemp) : 0,
            recap: res.samenv ? res.samenv : '',
            humidity: parseFloat(res.lv) ? parseFloat(res.lv) : 0,
            windDirection: res.windr ? res.windr : '',
            windSpeedMS: parseFloat(res.windms) ? parseFloat(res.windms) : 0,
            windForce: parseFloat(res.winds) ? parseFloat(res.winds) : 0,
            windSpeedKMH: parseFloat(res.windkmh) ? parseFloat(res.windkmh) : 0,
            airPressure: parseFloat(res.luchtd) ? parseFloat(res.luchtd) : 0,
            airPressureMMHG: parseFloat(res.ldmmhg) ? parseFloat(res.ldmmhg) : 0,
            dewPoint: parseFloat(res.dauwp) ? parseFloat(res.dauwp) : 0,
            sight: parseFloat(res.zicht) ? parseFloat(res.zicht) : 0,
            expected: res.verw ? res.verw : '',
            sunUp: res.sup ? res.sup : '',
            sunDown: res.sunder ? res.sunder : '',
            expectedTodayRecap: res.d0weer ? res.d0weer : '',
            expectedTodayMaxTemp: parseFloat(res.d0tmax) ? parseFloat(res.d0tmax) : 0,
            expectedTodayMinTemp: parseFloat(res.d0tmin) ? parseFloat(res.d0tmin) : 0,
            expectedTodayWindForce: parseFloat(res.d0winds) ? parseFloat(res.d0winds) : 0,
            expectedTodayWindSpeedMS: parseFloat(res.d0windms) ? parseFloat(res.d0windms) : 0,
            expectedTodayWindSpeedKMH: parseFloat(res.d0windkmh) ? parseFloat(res.d0windkmh) : 0,
            expectedTodayWindDirection: res.d0windr ? res.d0windr : '',
            expectedTodayPrecipitation: parseFloat(res.d0neerslag) ? parseFloat(res.d0neerslag) : 0,
            expectedTodaySunshine: parseFloat(res.d0zon) ? parseFloat(res.d0zon) : 0,
            expectedTomorrowRecap: res.d1weer ? res.d1weer : '',
            expectedTomorrowMaxTemp: parseFloat(res.d1tmax) ? parseFloat(res.d1tmax) : 0,
            expectedTomorrowMinTemp: parseFloat(res.d1tmin) ? parseFloat(res.d1tmin) : 0,
            expectedTomorrowWindForce: parseFloat(res.d1winds) ? parseFloat(res.d1winds) : 0,
            expectedTomorrowWindSpeedMS: parseFloat(res.d1windms) ? parseFloat(res.d1windms) : 0,
            expectedTomorrowWindSpeedKMH: parseFloat(res.d1windkmh) ? parseFloat(res.d1windkmh) : 0,
            expectedTomorrowWindDirection: res.d1windr ? res.d1windr : '',
            expectedTomorrowPrecipitation: parseFloat(res.d1neerslag)
              ? parseFloat(res.d1neerslag) : 0,
            expectedTomorrowSunshine: parseFloat(res.d1zon) ? parseFloat(res.d1zon) : 0,
            expectedDayAfterTomorrowRecap: res.d2weer ? res.d2weer : '',
            expectedDayAfterTomorrowMaxTemp: parseFloat(res.d2tmax) ? parseFloat(res.d2tmax) : 0,
            expectedDayAfterTomorrowMinTemp: parseFloat(res.d2tmin) ? parseFloat(res.d2tmin) : 0,
            expectedDayAfterTomorrowWindForce: parseFloat(res.d2winds)
              ? parseFloat(res.d2winds) : 0,
            expectedDayAfterTomorrowWindSpeedMS: parseFloat(res.d2windms)
              ? parseFloat(res.d2windms) : 0,
            expectedDayAfterTomorrowWindSpeedKMH: parseFloat(res.d2windkmh)
              ? parseFloat(res.d2windkmh) : 0,
            expectedDayAfterTomorrowWindDirection: res.d2windr ? res.d2windr : '',
            expectedDayAfterTomorrowPrecipitation: parseFloat(res.d2neerslag)
              ? parseFloat(res.d2neerslag) : 0,
            expectedDayAfterTomorrowSunshine: parseFloat(res.d2zon) ? parseFloat(res.d2zon) : 0,
            currentWeatherAlarm: res.alarm ? res.alarm : '',
          };
          receivedNewDataTrigger.trigger(tokens)
            .catch(this.error);
        }).catch(err => {
          console.log(err);
        });
    });
  }

}

module.exports = KNMI;
