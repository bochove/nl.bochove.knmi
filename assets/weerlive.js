'use strict';

const fetch = require('node-fetch');

module.exports = function retrieveWeerliveData(lat, lon, key) {
  const windDirectionToDegrees = direction => {
    if (!direction) {
      direction = '';
    }

    const degrees = {
      N: 0,
      NOORD: 0,
      NNO: 22.5,
      NON: 22.5,
      ONN: 22.5,
      NO: 45,
      ON: 45,
      OON: 67.5,
      ONO: 67.5,
      NOO: 67.5,
      OOST: 90,
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
      ZUID: 202.5,
      ZZW: 202.5,
      ZWZ: 202.5,
      WZZ: 202.5,
      ZW: 225,
      WZ: 225,
      WWZ: 247.5,
      WZW: 247.5,
      ZWW: 247.5,
      W: 270,
      WEST: 292.5,
      WWN: 292.5,
      WNW: 292.5,
      NWW: 292.5,
      NW: 315,
      WN: 315,
      NNW: 337.5,
      NWN: 337.5,
      WNN: 337.5,
    };

    let response = degrees[direction.toUpperCase().trim()];

    if (response === undefined) {
      response = null;
    }
    return response;
  };
  return fetch(`http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${lat},${lon}`)
    .then(res => res.json()).then(res => {
      // noinspection JSUnresolvedVariable
      if (res.liveweer && Array.isArray(res.liveweer) && res.liveweer.length === 1) {
        res = res.liveweer[0];
      }

      // noinspection JSUnresolvedVariable
      return {
        city: res.plaats ? res.plaats : '',
        currentTemp: parseFloat(res.temp) ? parseFloat(res.temp) : 0,
        feelTemp: parseFloat(res.gtemp) ? parseFloat(res.gtemp) : 0,
        recap: res.samenv ? res.samenv : '',
        humidity: parseFloat(res.lv) ? parseFloat(res.lv) : 0,
        windDirection: res.windr ? res.windr : '',
        windDirectionDegrees: windDirectionToDegrees(res.windr),
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
        expectedTodayWindForce: parseFloat(res.d0windk) ? parseFloat(res.d0windk) : 0,
        expectedTodayWindSpeedMS: parseFloat(res.d0windms) ? parseFloat(res.d0windms) : 0,
        expectedTodayWindSpeedKMH: parseFloat(res.d0windkmh) ? parseFloat(res.d0windkmh) : 0,
        expectedTodayWindDirection: res.d0windr ? res.d0windr : '',
        expectedTodayWindDirectionDegrees: windDirectionToDegrees(res.d0windr),
        expectedTodayPrecipitation: parseFloat(res.d0neerslag) ? parseFloat(res.d0neerslag) : 0,
        expectedTodaySunshine: parseFloat(res.d0zon) ? parseFloat(res.d0zon) : 0,
        expectedTomorrowRecap: res.d1weer ? res.d1weer : '',
        expectedTomorrowMaxTemp: parseFloat(res.d1tmax) ? parseFloat(res.d1tmax) : 0,
        expectedTomorrowMinTemp: parseFloat(res.d1tmin) ? parseFloat(res.d1tmin) : 0,
        expectedTomorrowWindForce: parseFloat(res.d1windk) ? parseFloat(res.d1windk) : 0,
        expectedTomorrowWindSpeedMS: parseFloat(res.d1windms) ? parseFloat(res.d1windms) : 0,
        expectedTomorrowWindSpeedKMH: parseFloat(res.d1windkmh) ? parseFloat(res.d1windkmh) : 0,
        expectedTomorrowWindDirection: res.d1windr ? res.d1windr : '',
        expectedTomorrowWindDirectionDegrees: windDirectionToDegrees(res.d1windr),
        expectedTomorrowPrecipitation: parseFloat(res.d1neerslag)
          ? parseFloat(res.d1neerslag) : 0,
        expectedTomorrowSunshine: parseFloat(res.d1zon) ? parseFloat(res.d1zon) : 0,
        expectedDayAfterTomorrowRecap: res.d2weer ? res.d2weer : '',
        expectedDayAfterTomorrowMaxTemp: parseFloat(res.d2tmax) ? parseFloat(res.d2tmax) : 0,
        expectedDayAfterTomorrowMinTemp: parseFloat(res.d2tmin) ? parseFloat(res.d2tmin) : 0,
        expectedDayAfterTomorrowWindForce: parseFloat(res.d2windk)
          ? parseFloat(res.d2windk) : 0,
        expectedDayAfterTomorrowWindSpeedMS: parseFloat(res.d2windms)
          ? parseFloat(res.d2windms) : 0,
        expectedDayAfterTomorrowWindSpeedKMH: parseFloat(res.d2windkmh)
          ? parseFloat(res.d2windkmh) : 0,
        expectedDayAfterTomorrowWindDirection: res.d2windr ? res.d2windr : '',
        expectedDayAfterTomorrowWindDirectionDegrees: windDirectionToDegrees(res.d2windr),
        expectedDayAfterTomorrowPrecipitation: parseFloat(res.d2neerslag)
          ? parseFloat(res.d2neerslag) : 0,
        expectedDayAfterTomorrowSunshine: parseFloat(res.d2zon) ? parseFloat(res.d2zon) : 0,
        currentWeatherAlarm: res.alarm ? res.alarm : '',
      };
    }).catch(err => {
      this.log(err);
    });
};
