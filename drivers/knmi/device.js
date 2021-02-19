'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class KNMIDevice extends Homey.Device {

  timer;
  triggers = {};

  // noinspection JSUnusedGlobalSymbols
  onInit() {
    this.log('MyDevice has been inited');

    // init all the triggers
    const triggersToRegister = [
      'city',
      'currentTemp',
      'feelTemp',
      'recap',
      'humidity',
      'windDirection',
      'windDirectionDegrees',
      'windSpeedMS',
      'windForce',
      'windSpeedKMH',
      'airPressure',
      'airPressureMMHG',
      'dewPoint',
      'sight',
      'expected',
      'sunUp',
      'sunDown',
      'expectedTodayRecap',
      'expectedTodayMaxTemp',
      'expectedTodayMinTemp',
      'expectedTodayWindForce',
      'expectedTodayWindSpeedMS',
      'expectedTodayWindSpeedKMH',
      'expectedTodayWindDirection',
      'expectedTodayWindDirectionDegrees',
      'expectedTodayPrecipitation',
      'expectedTodaySunshine',
      'expectedTomorrowRecap',
      'expectedTomorrowMaxTemp',
      'expectedTomorrowMinTemp',
      'expectedTomorrowWindForce',
      'expectedTomorrowWindSpeedMS',
      'expectedTomorrowWindSpeedKMH',
      'expectedTomorrowWindDirection',
      'expectedTomorrowWindDirectionDegrees',
      'expectedTomorrowPrecipitation',
      'expectedTomorrowSunshine',
      'expectedDayAfterTomorrowRecap',
      'expectedDayAfterTomorrowMaxTemp',
      'expectedDayAfterTomorrowMinTemp',
      'expectedDayAfterTomorrowWindForce',
      'expectedDayAfterTomorrowWindSpeedMS',
      'expectedDayAfterTomorrowWindSpeedKMH',
      'expectedDayAfterTomorrowWindDirection',
      'expectedDayAfterTomorrowWindDirectionDegrees',
      'expectedDayAfterTomorrowPrecipitation',
      'expectedDayAfterTomorrowSunshine',
      'currentWeatherAlarm',
    ];

    triggersToRegister.forEach(trigger => {
      this.triggers[trigger] = this.homey.flow.getDeviceTriggerCard(
        // eslint-disable-next-line prefer-template
        trigger.replace(/([A-Z])/g, match => `_${match.toLowerCase()}`) + '_changed',
      );
    });

    const slightlyCloudyOrClearCondition = this.homey.flow.getConditionCard('slightly_cloudy_or_clear');
    slightlyCloudyOrClearCondition
      .registerRunListener(async args => {
        // noinspection JSUnresolvedVariable
        if (!args || !args.when) {
          return false;
        }
        let weather;
        switch (args.when) {
          case 'now':
            weather = this.getCapabilityValue('recap');
            break;
          case 'expected_today':
            weather = this.getCapabilityValue('expected_today_recap');
            break;
          case 'expected_tomorrow':
            weather = this.getCapabilityValue('expected_tomorrow_recap');
            break;
          case 'expected_day_after_tomorrow':
            weather = this.getCapabilityValue('expected_day_after_tomorrow_recap');
            break;
          default:
            weather = '';
        }
        return ['onbewolkt', 'licht bewolkt', 'lichtbewolkt', 'zonnig'].includes(weather);
      });

    this.refresh();
  }

  windDirectionToDegrees(direction) {
    const degrees = {
      N: 0,
      NNO: 22.5,
      NON: 22.5,
      ONN: 22.5,
      NO: 45,
      ON: 45,
      OON: 67.5,
      ONO: 67.5,
      NOO: 67.5,
      O: 90,
      OOZ: 112.5,
      OZO: 112.5,
      ZOO: 112.5,
      ZO: 135,
      OZ: 135,
      ZZO: 157.5,
      ZOZ: 157.5,
      OZZ: 157.5,
      Z: 180,
      ZZW: 202.5,
      ZWZ: 202.5,
      WZZ: 202.5,
      ZW: 225,
      WZ: 225,
      WWZ: 247.5,
      WZW: 247.5,
      ZWW: 247.5,
      W: 270,
      WWN: 292.5,
      WNW: 292.5,
      NWW: 292.5,
      NW: 315,
      WN: 315,
      NNW: 337.5,
      NWN: 337.5,
      WNN: 337.5,
    };

    return degrees[direction.toUpperCase()] || null;
  }

  refresh() {
    // we want a refresh to occur as close to the 10 minute refresh at KNMI as possible
    // refreshes occur at round times, 12:00, 12:10 etc.
    const time = new Date();
    const newRefreshAt = new Date();
    newRefreshAt.setTime(time.getTime() + (10 * 60 * 1000));
    const newMinutes = Math.floor(newRefreshAt.getMinutes() / 10) * 10;
    const newTime = new Date(
      newRefreshAt.getFullYear(),
      newRefreshAt.getMonth(),
      newRefreshAt.getDate(),
      newRefreshAt.getHours(),
      newMinutes,
      30,
      0,
    );

    this.timer = setTimeout(this.refresh.bind(this), (newTime - time));
    // refresh is repeated after 10 minutes

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
        this.setCapability('recap', res.samenv ? res.samenv.toLowerCase() : '');
        this.setCapability('humidity', parseFloat(res.lv) ? parseFloat(res.lv) : 0);
        this.setCapability('windDirection', res.windr ? res.windr : '');
        this.setCapability('windDirectionDegrees', this.windDirectionToDegrees(res.windr));
        this.setCapability('windSpeedMS', parseFloat(res.windms) ? parseFloat(res.windms) : 0);
        this.setCapability('windForce', parseFloat(res.winds) ? parseFloat(res.winds) : 0);
        this.setCapability('windSpeedKMH', parseFloat(res.windkmh) ? parseFloat(res.windkmh) : 0);
        this.setCapability('airPressure', parseFloat(res.luchtd) ? parseFloat(res.luchtd) : 0);
        this.setCapability('airPressureMMHG', parseFloat(res.ldmmhg) ? parseFloat(res.ldmmhg) : 0);
        this.setCapability('dewPoint', parseFloat(res.dauwp) ? parseFloat(res.dauwp) : 0);
        this.setCapability('sight', parseFloat(res.zicht) ? parseFloat(res.zicht) : 0);
        this.setCapability('expected', res.verw ? res.verw : '');
        this.setCapability('sunUp', res.sup ? res.sup : '');
        this.setCapability('sunDown', res.sunder ? res.sunder : '');
        this.setCapability('expectedTodayRecap', res.d0weer ? res.d0weer.toLowerCase() : '');
        this.setCapability('expectedTodayMaxTemp', parseFloat(res.d0tmax) ? parseFloat(res.d0tmax) : 0);
        this.setCapability('expectedTodayMinTemp', parseFloat(res.d0tmin) ? parseFloat(res.d0tmin) : 0);
        this.setCapability('expectedTodayWindForce', parseFloat(res.d0winds) ? parseFloat(res.d0winds) : 0);
        this.setCapability('expectedTodayWindSpeedMS', parseFloat(res.d0windms) ? parseFloat(res.d0windms) : 0);
        this.setCapability('expectedTodayWindSpeedKMH', parseFloat(res.d0windkmh) ? parseFloat(res.d0windkmh) : 0);
        this.setCapability('expectedTodayWindDirection', res.d0windr ? res.d0windr : '');
        this.setCapability('expectedTodayWindDirectionDegrees', this.windDirectionToDegrees(res.d0windr));
        this.setCapability('expectedTodayPrecipitation', parseFloat(res.d0neerslag) ? parseFloat(res.d0neerslag) : 0);
        this.setCapability('expectedTodaySunshine', parseFloat(res.d0zon) ? parseFloat(res.d0zon) : 0);
        this.setCapability('expectedTomorrowRecap', res.d1weer ? res.d1weer.toLowerCase() : '');
        this.setCapability('expectedTomorrowMaxTemp', parseFloat(res.d1tmax) ? parseFloat(res.d1tmax) : 0);
        this.setCapability('expectedTomorrowMinTemp', parseFloat(res.d1tmin) ? parseFloat(res.d1tmin) : 0);
        this.setCapability('expectedTomorrowWindForce', parseFloat(res.d1winds) ? parseFloat(res.d1winds) : 0);
        this.setCapability('expectedTomorrowWindSpeedMS', parseFloat(res.d1windms) ? parseFloat(res.d1windms) : 0);
        this.setCapability('expectedTomorrowWindSpeedKMH', parseFloat(res.d1windkmh) ? parseFloat(res.d1windkmh) : 0);
        this.setCapability('expectedTomorrowWindDirection', this.wres.d1windr ? res.d1windr : '');
        this.setCapability('expectedTomorrowWindDirectionDegrees', this.windDirectionToDegrees(res.d1windr));
        this.setCapability('expectedTomorrowPrecipitation', parseFloat(res.d1neerslag) ? parseFloat(res.d1neerslag) : 0);
        this.setCapability('expectedTomorrowSunshine', parseFloat(res.d1zon) ? parseFloat(res.d1zon) : 0);
        this.setCapability('expectedDayAfterTomorrowRecap', res.d2weer ? res.d2weer.toLowerCase() : '');
        this.setCapability('expectedDayAfterTomorrowMaxTemp', parseFloat(res.d2tmax) ? parseFloat(res.d2tmax) : 0);
        this.setCapability('expectedDayAfterTomorrowMinTemp', parseFloat(res.d2tmin) ? parseFloat(res.d2tmin) : 0);
        this.setCapability('expectedDayAfterTomorrowWindForce', parseFloat(res.d2winds) ? parseFloat(res.d2winds) : 0);
        this.setCapability('expectedDayAfterTomorrowWindSpeedMS', parseFloat(res.d2windms) ? parseFloat(res.d2windms) : 0);
        this.setCapability('expectedDayAfterTomorrowWindSpeedKMH', parseFloat(res.d2windkmh) ? parseFloat(res.d2windkmh) : 0);
        this.setCapability('expectedDayAfterTomorrowWindDirection', res.d2windr ? res.d2windr : '');
        this.setCapability('expectedDayAfterTomorrowWindDirectionDegrees', this.windDirectionToDegrees(res.d2windr));
        this.setCapability('expectedDayAfterTomorrowPrecipitation', parseFloat(res.d2neerslag) ? parseFloat(res.d2neerslag) : 0);
        this.setCapability('expectedDayAfterTomorrowSunshine', parseFloat(res.d2zon) ? parseFloat(res.d2zon) : 0);
        this.setCapability('currentWeatherAlarm', res.alarm ? res.alarm : '');
        this.log('updated capabilities');
      }).catch(err => {
        this.log(err);
      });
  }

  setCapability(capability, value) {
    const deviceCapability = capability.replace(/([A-Z])/g, match => `_${match.toLowerCase()}`);

    if (this.hasCapability(deviceCapability)) {
      const currentValue = this.getCapabilityValue(deviceCapability);
      if (currentValue !== value) {
        this.setCapabilityValue(deviceCapability, value).catch(err => this.log(`Could not set ${capability} to ${value}, of type ${typeof value}`, err));
        if (!this.triggers[capability]) {
          this.log(`could not find the trigger for ${capability}`);
        } else {
          this.triggers[capability].trigger(this, { new_value: value, old_value: currentValue })
            .catch(err => {
              this.log(this.triggers[capability].id, err);
            }).then(() => this.log(`fired trigger: ${this.triggers[capability].id}`));
        }
      }
    } else {
      this.log(`Tried to set ${deviceCapability}, but no such capability found.`);
    }
  }

  // noinspection JSUnusedGlobalSymbols
  onDeleted() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    super.onDeleted();
  }

}

module.exports = KNMIDevice;
