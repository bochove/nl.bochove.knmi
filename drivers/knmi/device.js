'use strict';

const Homey = require('homey');
const retrieveWeerliveData = require('../../assets/weerlive');

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

    return retrieveWeerliveData(lat, lon, key).then(tokens => {
      (Object.keys(tokens)).forEach(capability => {
        this.setCapability(capability, tokens[capability]);
      });

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
