(function () {
  const LAT = 44.96949;
  const LON = -93.26296;
  const URL =
    'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
    '&current=temperature_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,is_day,snowfall' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,snowfall_sum' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago&forecast_days=1';

  function getCondition(d) {
    var temp = d.temperature_2m;
    var precipitation = d.precipitation;
    var cloud_cover = d.cloud_cover;
    var wind = d.wind_speed_10m;
    var snowfall = d.snowfall;

    if (snowfall > 0.1)       return { label: 'Snowing',       emoji: '❄️' };
    if (precipitation > 0.05) return { label: 'Rainy',         emoji: '🌧️' };
    if (temp <= 32)            return { label: 'Freezing',      emoji: '🥶' };
    if (cloud_cover > 75)     return { label: 'Cloudy',        emoji: '☁️' };
    if (cloud_cover > 35)     return { label: 'Partly Cloudy', emoji: '⛅' };
    if (wind > 25)             return { label: 'Windy',         emoji: '💨' };
    if (temp >= 85)            return { label: 'Hot & Sunny',   emoji: '☀️' };
    return { label: 'Clear', emoji: d.is_day ? '☀️' : '🌙' };
  }

  function getActivity(d) {
    var temp = d.temperature_2m;
    var precipitation = d.precipitation;
    var snowfall = d.snowfall;
    var wind = d.wind_speed_10m;

    var isRaining  = precipitation > 0.05;
    var isSnowing  = snowfall > 0.1;
    var isCold     = temp < 28;
    var isTooWindy = wind > 30;
    var isGoodSnow = isSnowing || (temp <= 32 && temp >= 15);
    var isWarm     = temp >= 65 && temp <= 95;
    var isHot      = temp > 80;

    if (isRaining || isTooWindy) return { name: 'Weaving',      emoji: '🧶', type: 'inside' };
    if (isCold && !isGoodSnow)   return { name: 'Embroidery',   emoji: '🪡', type: 'inside' };
    if (isGoodSnow)              return { name: 'Snowboarding', emoji: '🏂', type: 'outside' };
    if (isHot && isWarm)         return { name: 'Wakeboarding', emoji: '🏄', type: 'outside' };
    if (isWarm)                  return { name: 'Biking',        emoji: '🚴', type: 'outside' };
    return { name: 'Weaving', emoji: '🧶', type: 'inside' };
  }

  fetch(URL)
    .then(function (res) {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(function (data) {
      var c = data.current;
      var condition = getCondition(c);
      var activity  = getActivity(c);
      var temp      = Math.round(c.temperature_2m);
      var feels     = Math.round(c.apparent_temperature);

      var card = document.getElementById('weather-card');
      card.innerHTML =
        '<div class="weather-card__top">' +
          '<span class="weather-card__location">Minneapolis, MN</span>' +
          '<span class="weather-card__condition">' + condition.label + '</span>' +
        '</div>' +
        '<div class="weather-card__main">' +
          '<span class="weather-card__emoji">' + condition.emoji + '</span>' +
          '<div class="weather-card__temp">' + temp + '<sup>°F</sup></div>' +
        '</div>' +
        '<div class="weather-card__feels">Feels like ' + feels + '°F</div>' +
        '<div class="weather-card__divider"></div>' +
        '<div class="weather-card__activity-label">What Laura should be doing right now</div>' +
        '<div class="weather-card__activity">' +
          '<span class="weather-card__activity-emoji">' + activity.emoji + '</span>' +
          activity.name +
        '</div>';
    })
    .catch(function () {
      var card = document.getElementById('weather-card');
      card.innerHTML = '<div class="weather-card__loading">Weather unavailable right now.</div>';
    });
})();
