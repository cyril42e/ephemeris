function createTimePeriodsTop(containerId, data) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    let totalDuration = data.reduce((sum, item) => sum + item.duration, 0);

    data.forEach(item => {
        if (item.duration == 0) {
            return;
        }
        const period = document.createElement('div');
        period.className = `period ${item.class}`;
        period.style.width = `${(item.duration / totalDuration) * 100}%`;
        period.textContent = item.name;
        container.appendChild(period);
    });
}

function createTimePeriodsBottom(containerId, data, totalDuration) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    data.forEach(item => {
        if (item.duration == 0) {
            return;
        }
        const period = document.createElement('div');
        period.className = `period ${item.class}`;
        period.style.position = 'absolute';
        period.style.left = `${(item.start / totalDuration) * 100}%`;
        period.style.width = `${(item.duration / totalDuration) * 100}%`;
        period.style.height = '100%';  // Set the height to 100%
        period.textContent = item.name;
        container.appendChild(period);
    });
}


function createTimePoints(containerId, points, totalDuration, top) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    points.forEach(point => {
        // .time criterion is not sufficient due to +1/-1 that are sometimes legit, and sometimes not
        // FIXME .position criterion uses hard coded position equal to (holeDuration+dashDuration)*2
        if (point.time === '' || point.position <= 12) {
            return;
        }
        const timePoint = document.createElement('div');
        timePoint.className = `time-point ${point.class}`;
        timePoint.innerHTML = top ? point.name + '<br/><b>' + point.time + '</b>' : '<b>' + point.time + '</b></br>' + point.name;
        timePoint.style.left = `${(point.position / totalDuration) * 100}%`;
        arrowPosition = (point.arrow === 'left') ? 25 : ((point.arrow === 'right') ? 75 : 50);
        timePoint.style.setProperty('--arrow-position', `${arrowPosition}%`);
        timePoint.addEventListener('mouseenter', bringToFront);
        timePoint.addEventListener('click', bringToFront);
        container.appendChild(timePoint);
    });
}

function bringToFront(event) {
  // Remove 'front' class from all time points
  document.querySelectorAll('.time-point').forEach(point => {
    point.classList.remove('front');
  });
  // Add 'front' class to the hovered/clicked element
  event.currentTarget.classList.add('front');
}

document.addEventListener('DOMContentLoaded', function() {
    //***************************/
    // Controls

    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const dateInput = document.getElementById('date');
    const currentLocationButton = document.getElementById('current-location');
    const currentDateButton = document.getElementById('current-date');
    const addressInput = document.getElementById('address');
    const suggestionsDiv = document.getElementById('suggestions');
    const timezoneOutput = document.getElementById('timezone');
    let refreshTimeout;

    const emptyAddressStr = 'Search address...';
    function clearAddress() {
        addressInput.value = emptyAddressStr;
        addressInput.classList.add('empty');
    }
    function setAddress(text) {
        addressInput.value = text;
        addressInput.classList.remove('empty');
    }

    function dayDistance(eventDate, referenceDate) {
        return Math.abs((eventDate - referenceDate) / (1000 * 60 * 60 * 24));
    }

    function validateInputs() {
        let valid = true;

        if (latitudeInput.value < -90 || latitudeInput.value > 90 || latitudeInput.value === '') {
            latitudeInput.classList.add('invalid');
            valid = false;
        } else {
            latitudeInput.classList.remove('invalid');
        }

        if (longitudeInput.value < -180 || longitudeInput.value > 180 || longitudeInput.value === '') {
            longitudeInput.classList.add('invalid');
            valid = false;
        } else {
            longitudeInput.classList.remove('invalid');
        }

        if (dateInput.value === '') {
            dateInput.classList.add('invalid');
            valid = false;
        } else {
            dateInput.classList.remove('invalid');
        }

        return valid;
    }

    addressInput.addEventListener('focus', function() {
        if (addressInput.value === emptyAddressStr) {
            addressInput.value = '';
        }
        addressInput.classList.remove('empty');
    });

    addressInput.addEventListener('input', function() {
        const query = addressInput.value;
        if (query.length < 3) {
            suggestionsDiv.innerHTML = '';
            return;
        }
        fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`)
            .then(response => response.json())
            .then(data => {
                suggestionsDiv.innerHTML = '';
                data.features.forEach(feature => {
                    const properties = feature.properties;
                    const name = properties.name || '';
                    const region = properties.region || '';
                    const city = properties.city || '';
                    const country = properties.country || '';
                    const type = ' (' + properties.type + ')' || '';
                    const suggestionText = [name, city, region, country].filter(Boolean).join(', ') + type;
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = suggestionText;
                    suggestionItem.addEventListener('click', () => {
                        const coordinates = feature.geometry.coordinates;
                        latitudeInput.value = coordinates[1].toFixed(4);
                        longitudeInput.value = coordinates[0].toFixed(4);
                        setAddress(suggestionText);
                        suggestionsDiv.innerHTML = '';
                        updateEphemeris();
                    });
                    suggestionsDiv.appendChild(suggestionItem);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    document.addEventListener('click', function(event) {
        if (event.target !== addressInput && event.target.className !== 'suggestion-item' && (suggestionsDiv.innerHTML !== '' || addressInput.value === '')) {
            suggestionsDiv.innerHTML = '';
            clearAddress();
        }
    });

    function updateEphemeris() {
        if (!validateInputs()) return;

        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const observer = new Astronomy.Observer(latitude, longitude, 0.0);

        // Set the time to noon
        const { DateTime } = luxon;
        const selectedDate = new Date(dateInput.value);
        const timeZone = tzlookup(latitude, longitude);

        const civil00h = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate()},
            {zone: timeZone}
        ).toJSDate();
        const civil24h = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate(),
            hour: 24},
            {zone: timeZone}
        ).toJSDate();
        const civilNoon = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate(),
            hour: 12},
            {zone: timeZone}
        ).toJSDate();

        const timeFormat = new Intl.DateTimeFormat([], { timeZone: timeZone, hour: '2-digit', minute: '2-digit', hour12: false });

        function dayOffset(eventDate) {
            return Math.floor((eventDate - civil00h) / (1000 * 60 * 60 * 24));
        }

        function formatDateTime(eventDate, showDate = false) {
            const time = timeFormat.format(eventDate);
            const dayOff = dayOffset(eventDate);
            const dayOffStr = (dayOff > 0 ? '+' : '') + dayOff;
            if (Math.abs(dayOff) >= 1) {
                if (Math.abs(dayOff) < 2) {
                    return time + '&nbsp;' + dayOffStr;
                } else if (showDate) {
                    return dayOffStr;
                } else {
                    return '';
                }
            } else {
                return time;
            }
        }


        function getTimezoneOffset(date, timeZone) {
            const offsetFormat = new Intl.DateTimeFormat([], { timeZone: timeZone, timeZoneName: 'shortOffset' });
            let offset = offsetFormat.formatToParts(date).find(part => part.type === 'timeZoneName').value.slice(3);
            if (offset === '') {
                offset = '+0';
            }
            const match = offset.match(/([+-]?)(\d{1,2})(?::(\d{2}))?/);
            if (!match) {
                console.log('Invalid UTC offset format "' + offset + '" for time zone "' + timeZone + '"');
                return [offset, 0];
            }
            const sign = match[1] === '-' ? -1 : 1;
            const hours = parseInt(match[2], 10);
            const minutes = match[3] ? parseInt(match[3], 10) : 0;

	    return [offset, sign * (hours * 60 + minutes)];
        }

        function formatOffset(diff) {
            const diffHours = Math.floor(Math.abs(diff) / 60);
            const diffMinutes = Math.abs(diff) % 60;
            const sign = diff >= 0 ? '+' : '-';

            const strMinutes = (diffMinutes !== 0 ? `:${diffMinutes.toString().padStart(2, '0')}` : '');
            return `${sign}${diffHours}${strMinutes}`;
        }

        const targetOffset = getTimezoneOffset(selectedDate, timeZone);
        const localOffset = getTimezoneOffset(selectedDate, undefined);
        const diff = formatOffset(targetOffset[1] - localOffset[1]);
        timezoneOutput.textContent = timeZone + ' (UTC' + targetOffset[0] + ' = local' + diff + ')';

        // Calculate transit time
        function searchClosestTransit(object, date) {
            const transitAfter = Astronomy.SearchHourAngle(object, observer, 0, date, +1).time.date;
            const transitBefore = Astronomy.SearchHourAngle(object, observer, 0, date, -1).time.date;
            return ((civilNoon - transitBefore) < (transitAfter - civilNoon)) ? transitBefore : transitAfter;
        }
        const solarNoon = searchClosestTransit("Sun", civilNoon); // use the solar noon when symmetry is required

        const limitDays = 300; // Search within a wide range to handle polar regions
        const objects = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
        const sunDawnDuskRow = document.getElementById('sun-dawn-dusk-row');
        const sunBlueGoldenHourRow = document.getElementById('sun-blue-golden-hour-row');
        const tableBody = document.getElementById('ephemeris-table');

        sunDawnDuskRow.innerHTML = ''; // Clear previous sun dawn/dusk data
        sunBlueGoldenHourRow.innerHTML = ''; // Clear previous sun blue/golden hour data
        tableBody.innerHTML = ''; // Clear previous ephemeris data

        // Calculate dawn and dusk times for the Sun
        const astronomicalDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -18).date;
        const nauticalDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -12).date;
        const civilDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -6).date;
        const civilDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -6).date;
        const nauticalDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -12).date;
        const astronomicalDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -18).date;

        // Add Sun dawn and dusk row
        const sunDawnDuskRowContent = document.createElement('tr');
        sunDawnDuskRowContent.innerHTML = `
            <td>${formatDateTime(astronomicalDawn)}</td>
            <td>${formatDateTime(nauticalDawn)}</td>
            <td>${formatDateTime(civilDawn)}</td>
            <td>${formatDateTime(civilDusk)}</td>
            <td>${formatDateTime(nauticalDusk)}</td>
            <td>${formatDateTime(astronomicalDusk)}</td>
        `;
        sunDawnDuskRow.appendChild(sunDawnDuskRowContent);

        // Calculate blue and golden hour times for the Sun
        const blueHourBeginAsc = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -6).date;
        const goldenHourBeginAsc = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -4).date;
        const goldenHourEndAsc = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, 6).date;
        const goldenHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, 6).date;
        const blueHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -4).date;
        const blueHourEndDesc = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -6).date;

        // Add Sun blue and golden hour row
        const sunBlueGoldenHourRowContent = document.createElement('tr');
        sunBlueGoldenHourRowContent.innerHTML = `
            <td>${formatDateTime(blueHourBeginAsc)}</td>
            <td>${formatDateTime(goldenHourBeginAsc)}</td>
            <td>${formatDateTime(goldenHourEndAsc)}</td>
            <td>${formatDateTime(goldenHourBeginDesc)}</td>
            <td>${formatDateTime(blueHourBeginDesc)}</td>
            <td>${formatDateTime(blueHourEndDesc)}</td>
        `;
        sunBlueGoldenHourRow.appendChild(sunBlueGoldenHourRowContent);

        // Compute Sun rise and set time
        const sunRise = Astronomy.SearchRiseSet('Sun', observer, +1, solarNoon, -limitDays).date;
        const sunSet = Astronomy.SearchRiseSet('Sun', observer, -1, solarNoon, limitDays).date;

        const transitEquator = Astronomy.Equator('Sun', solarNoon, observer, true, true);
        const transitHorizon = Astronomy.Horizon(solarNoon, observer, transitEquator.ra, transitEquator.dec, 'normal');
        const peakElevation = transitHorizon.altitude;

        // Create timelines
        const extremitiesDuration = 20;
        const dashDuration = 3;
        const holeDuration = 1;
        const extDuration = extremitiesDuration - holeDuration - dashDuration;
        const maxDuration = 120;
        const dayThreshold = 0.6;

        // Morning timeline data
        let offsetM = 0;
        let nightM = extDuration;
        let astronomicalTwilightM = Math.min((nauticalDawn-astronomicalDawn)/60000, maxDuration);
        let nauticalTwilightM = Math.min((civilDawn-nauticalDawn)/60000, maxDuration);
        let civilTwilightMr = (sunRise-civilDawn)/60000;
        let civilTwilightM = Math.min(civilTwilightMr, maxDuration);
        let blueHourM = ((goldenHourBeginAsc-blueHourBeginAsc)/60000) * civilTwilightM / civilTwilightMr; // scale like civilTwilight
        let goldenHourM = Math.min((goldenHourEndAsc-goldenHourBeginAsc)/60000, maxDuration);

        let dashTLM = 'night'; // Top Left Morning
        let dashTRM = 'day'; // Top Right Morning
        let dashBLM = 'invisible'; // Bottom Left Morning
        let dashBRM = 'invisible'; // Bottom Left Morning
        // check for missing periods when day is longer
        if (peakElevation > -12 && dayDistance(astronomicalDawn, solarNoon) > dayThreshold) {
            nightM = 0;
            astronomicalTwilightM = extDuration;
            offsetM = extDuration;
            dashTLM = 'astronomical-twilight';
            if (dayDistance(nauticalDawn, solarNoon) > dayThreshold) {
                astronomicalTwilightM = 0;
                nauticalTwilightM = extDuration;
                dashTLM = 'nautical-twilight'
                if (dayDistance(civilDawn, solarNoon) > dayThreshold) {
                    nauticalTwilightM = 0;
                    civilTwilightM = extDuration;
                    dashTLM = 'civil-twilight'
                    dashBLM = 'blue-hour'
                    if (dayDistance(goldenHourBeginAsc, solarNoon) > dayThreshold) {
                        blueHourM = 0;
                        dashBLM = 'golden-hour'
                        if (dayDistance(sunRise, solarNoon) > dayThreshold) {
                            civilTwilightM = 0;
                            dashTLM = 'day'
                            if (dayDistance(goldenHourEndAsc, solarNoon) > dayThreshold) {
                                goldenHourM = 0;
                                dashBLM = 'invisible';
                            }
                        }
                    }
                }
            }
        }

        let dayM = goldenHourM + blueHourM - civilTwilightM + extDuration;
        if (dayM == extDuration && civilTwilightM == 0.0) dayM = maxDuration*2;

        let offsetDM = 0; // Day Morning
        // check for missing periods when night is longer
        // fixme peakElevation threshold justification is not clear
        if (peakElevation < 12 && dayDistance(goldenHourEndAsc, solarNoon) > dayThreshold) {
            goldenHourM = civilTwilightM - blueHourM + extDuration;
            dayM = goldenHourM + blueHourM - civilTwilightM;
            dashBRM = 'golden-hour'
            if (dayDistance(sunRise, solarNoon) > dayThreshold) {
                dayM = 0;
                civilTwilightM = blueHourM + extDuration;
                dashTRM = 'civil-twilight';
                goldenHourM = extDuration;
                dashBRM = 'golden-hour';
                if (dayDistance(goldenHourBeginAsc, solarNoon) > dayThreshold) {
                    goldenHourM = 0;
                    civilTwilightM = extDuration;
                    blueHourM = extDuration;
                    dashBRM = 'blue-hour';
                    if (dayDistance(civilDawn, solarNoon) > dayThreshold) {
                        civilTwilightM = 0;
                        blueHourM = 0;
                        nauticalTwilightM = extDuration;
                        dashTRM = 'nautical-twilight'
                        dashBRM = 'invisible';
                        if (dayDistance(nauticalDawn, solarNoon) > dayThreshold) {
                            nauticalTwilightM = 0;
                            astronomicalTwilightM = maxDuration;
                            offsetM = -maxDuration + extDuration;
                            nightM = maxDuration;
                            dashTRM = 'astronomical-twilight'
                            if (dayDistance(astronomicalDawn, solarNoon) > dayThreshold) {
                                astronomicalTwilightM = 0;
                                nightM = maxDuration*2;
                                dashTRM = 'night'
                            }
                        }
                    }
                }
            }
        }

        const astronomicalDawnM = extremitiesDuration - offsetM;
        const nauticalDawnM = astronomicalDawnM + astronomicalTwilightM;
        const civilDawnM = nauticalDawnM + nauticalTwilightM;
        const sunRiseM = civilDawnM + civilTwilightM;
        const blueHourStartM = civilDawnM;
        const goldenHourStartM = civilDawnM + blueHourM;
        const goldenHourEndM = goldenHourStartM + goldenHourM;

        const morningPeriodsTop = [
            {name: '', class: dashTLM, duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Night', class: 'night', duration: nightM},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: astronomicalTwilightM},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: nauticalTwilightM},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: civilTwilightM},
            {name: 'Day', class: 'day', duration: dayM},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: dashTRM, duration: dashDuration},
            {name: '', class: 'invisible', duration: dashDuration + holeDuration}
        ];
        const morningTotalDuration = morningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);

        const morningPeriodsBottom = [
            {name: '', class: dashBLM, start: 0, duration: dashDuration},
            {name: 'Blue Hour', class: 'blue-hour', start: blueHourStartM, duration: blueHourM},
            {name: 'Golden Hour', class: 'golden-hour', start: goldenHourStartM, duration: goldenHourM},
            {name: '', class: dashBRM, start: morningTotalDuration - holeDuration - dashDuration*2, duration: dashDuration}
        ];

        const morningPointsTop = [
            {name: 'Astro.\nDawn', time: formatDateTime(astronomicalDawn), class: '', position: astronomicalDawnM, arrow: 'center'},
            {name: 'Nautical\nDawn', time: formatDateTime(nauticalDawn), class: '', position: nauticalDawnM, arrow: 'center'},
            {name: 'Civil\nDawn', time: formatDateTime(civilDawn), class: '', position: civilDawnM, arrow: 'center'},
            {name: 'Sun\nRise', time: formatDateTime(sunRise), class: 'sun-event', position: sunRiseM, arrow: 'center'}
        ];

        const morningPointsBottom = [
            {name: '', time: formatDateTime(blueHourBeginAsc), class: '', position: blueHourStartM, arrow: 'right'},
            {name: '', time: formatDateTime(goldenHourBeginAsc), class: '', position: goldenHourStartM, arrow: 'left'},
            {name: '', time: formatDateTime(goldenHourEndAsc), class: '', position: goldenHourEndM, arrow: 'center'}
        ];

        // Evening timeline data
        let offsetE = 0;
        let nightE = extDuration;
        let astronomicalTwilightE = Math.min((astronomicalDusk-nauticalDusk)/60000, maxDuration);
        let nauticalTwilightE = Math.min((nauticalDusk-civilDusk)/60000, maxDuration);
        let civilTwilightEr = (civilDusk-sunSet)/60000;
        let civilTwilightE = Math.min(civilTwilightEr, maxDuration);
        let blueHourE = ((blueHourEndDesc-blueHourBeginDesc)/60000) * civilTwilightE / civilTwilightEr; // scale like civilTwilight
        let goldenHourE = Math.min((blueHourBeginDesc-goldenHourBeginDesc)/60000, maxDuration);

        let dashTLE = 'day'; // Top Left Evening
        let dashTRE = 'night'; // Top Right Evening
        let dashBLE = 'invisible'; // Bottom Left Evening
        let dashBRE = 'invisible'; // Bottom Right Evening
        // check for missing periods when day is longer
        if (peakElevation > -12 && dayDistance(astronomicalDusk, solarNoon) > dayThreshold) {
            nightE = 0;
            astronomicalTwilightE = extDuration;
            dashTRE = 'astronomical-twilight';
            if (dayDistance(nauticalDusk, solarNoon) > dayThreshold) {
                astronomicalTwilightE = 0;
                nauticalTwilightE = extDuration;
                dashTRE = 'nautical-twilight'
                if (dayDistance(civilDusk, solarNoon) > dayThreshold) {
                    nauticalTwilightE = 0;
                    civilTwilightE = extDuration;
                    dashTRE = 'civil-twilight'
                    dashBRE = 'blue-hour'
                    if (dayDistance(blueHourBeginDesc, solarNoon) > dayThreshold) {
                        blueHourE = 0;
                        dashBRE = 'golden-hour'
                        if (dayDistance(sunSet, solarNoon) > dayThreshold) {
                            civilTwilightE = 0;
                            dashTRE = 'day'
                            if (dayDistance(goldenHourBeginDesc, solarNoon) > dayThreshold) {
                                goldenHourE = 0;
                                dashBRE = 'invisible'
                                offsetE = extDuration;
                            }
                        }
                    }
                }
            }
        }

        let dayE = extDuration;

        let offsetGE = 0; // Golden Evening
        // check for missing periods when night is longer
        // fixme peakElevation threshold justification is not clear
        if (peakElevation < 12 && dayDistance(goldenHourBeginDesc, solarNoon) > dayThreshold) {
            goldenHourE = civilTwilightE - blueHourE + extDuration;
            offsetGE = extDuration - holeDuration - dashDuration;
            dashBLE = 'golden-hour'
            if (dayDistance(sunSet, solarNoon) > dayThreshold) {
                dayE = 0;
                civilTwilightE = extDuration + blueHourE;
                dashTLE = 'civil-twilight';
                goldenHourE = extDuration;
                dashBLE = 'golden-hour';
                if (dayDistance(blueHourBeginDesc, solarNoon) > dayThreshold) {
                    goldenHourE = 0;
                    civilTwilightE = extDuration;
                    blueHourE = extDuration;
                    dashBLE = 'blue-hour';
                    if (dayDistance(civilDusk, solarNoon) > dayThreshold) {
                        civilTwilightE = 0;
                        blueHourE = 0;
                        nauticalTwilightE = extDuration;
                        dashTLE = 'nautical-twilight'
                        dashBLE = 'invisible';
                        if (dayDistance(nauticalDusk, solarNoon) > dayThreshold) {
                            nauticalTwilightE = 0;
                            astronomicalTwilightE = maxDuration;
                            nightE = maxDuration;
                            dashTLE = 'astronomical-twilight'
                            if (dayDistance(astronomicalDusk, solarNoon) > dayThreshold) {
                                astronomicalTwilightE = 0;
                                nightE = maxDuration*2;
                                dashTLE = 'night'
                            }
                        }
                    }
                }
            }
        }

        const goldenHourStartE = extremitiesDuration - offsetE - offsetGE;
        const goldenHourEndE = goldenHourStartE + goldenHourE;
        const civilDuskE = goldenHourEndE + blueHourE;
        const nauticalDuskE = civilDuskE + nauticalTwilightE;
        const astronomicalDuskE = nauticalDuskE + astronomicalTwilightE;
        const sunSetE = civilDuskE - civilTwilightE;
        if (dayE != 0.0) dayE = goldenHourE == 0.0 ? maxDuration*2 : sunSetE - holeDuration*2 - dashDuration*2;

        const eveningPeriodsTop = [
            {name: '', class: 'invisible', duration: dashDuration + holeDuration},
            {name: '', class: dashTLE, duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Day', class: 'day', duration: dayE},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: civilTwilightE},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: nauticalTwilightE},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: astronomicalTwilightE},
            {name: 'Night', class: 'night', duration: nightE},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: dashTRE, duration: dashDuration}
        ];
        const eveningTotalDuration = eveningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);

        const eveningPeriodsBottom = [
            {name: '', class: dashBLE, start: dashDuration + holeDuration, duration: dashDuration},
            {name: 'Golden Hour', class: 'golden-hour', start: goldenHourStartE, duration: goldenHourE},
            {name: 'Blue Hour', class: 'blue-hour', start: goldenHourEndE, duration: blueHourE},
            {name: '', class: dashBRE, start: eveningTotalDuration - dashDuration, duration: dashDuration}
        ];

        const eveningPointsTop = [
            {name: 'Sun\nSet', time: formatDateTime(sunSet), class: 'sun-event', position: sunSetE, arrow: 'center'},
            {name: 'Civil\nDusk', time: formatDateTime(civilDusk), class: '', position: civilDuskE, arrow: 'center'},
            {name: 'Nautical\nDusk', time: formatDateTime(nauticalDusk), class: '', position: nauticalDuskE, arrow: 'center'},
            {name: 'Astro.\nDusk', time: formatDateTime(astronomicalDusk), class: '', position: astronomicalDuskE, arrow: 'center'}
        ];

        const eveningPointsBottom = [
            {name: '', time: formatDateTime(goldenHourBeginDesc), class: '', position: goldenHourStartE, arrow: 'center'},
            {name: '', time: formatDateTime(blueHourBeginDesc), class: '', position: goldenHourEndE, arrow: 'right'},
            {name: '', time: formatDateTime(blueHourEndDesc), class: '', position: civilDuskE, arrow: 'left'}
        ];

        createTimePeriodsTop('morning-periods-top', morningPeriodsTop);
        createTimePeriodsBottom('morning-periods-bottom', morningPeriodsBottom, morningTotalDuration);
        createTimePoints('morning-points-top', morningPointsTop, morningTotalDuration, true);
        createTimePoints('morning-points-bottom', morningPointsBottom, morningTotalDuration, false);

        createTimePeriodsTop('evening-periods-top', eveningPeriodsTop);
        createTimePeriodsBottom('evening-periods-bottom', eveningPeriodsBottom, eveningTotalDuration);
        createTimePoints('evening-points-top', eveningPointsTop, eveningTotalDuration, true);
        createTimePoints('evening-points-bottom', eveningPointsBottom, eveningTotalDuration, false);

        objects.forEach(objectName => {
            const row = document.createElement('tr');

            // Calculate ephemeris data

            // transit and phase
            let phase, transitTime;
            if (objectName === 'Sun') {
                transitTime = solarNoon;
                phase = '';
            } else {
                transitTime = searchClosestTransit(objectName, civilNoon);
                const pf = Astronomy.Illumination(objectName, transitTime).phase_fraction;
                const tomorrow = new Date(transitTime);
                tomorrow.setUTCDate(transitTime.getUTCDate()+1);
                const pf_t = Astronomy.Illumination(objectName, tomorrow).phase_fraction;
                phase = `${(pf * 100).toFixed(0)}%&nbsp;${pf_t>pf?'↗':'↘'}`;
            }
            const transitEquator = Astronomy.Equator(objectName, transitTime, observer, true, true);
            const transitHorizon = Astronomy.Horizon(transitTime, observer, transitEquator.ra, transitEquator.dec, 'normal');

            // rise and set
            let rise, set;
            let visible = true;
            let riseStr = '< -' + limitDays, setStr = '> +' + limitDays;
            if (transitHorizon.altitude > 0.0) { // visible
                // the object is for sure visible at transit, so look for rise in the past
                rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, -limitDays);
                set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, limitDays);
            } else {
                // the object may not be visible, so check it by looking for rise less than 1 day before
                rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, -1);
                if (rise === null) {
                    // the object is not visible, so get the last set and the next rise
                    set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, -limitDays);
                    rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, limitDays);
                    visible = false;
                    setStr = [riseStr, riseStr = setStr][0]; // swap
                } else {
                    set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, limitDays);
                }
            }

            let riseTime, riseHorizon;
            if (rise !== null) {
                riseTime = rise.date;
                const riseEquator = Astronomy.Equator(objectName, riseTime, observer, true, true);
                riseHorizon = Astronomy.Horizon(riseTime, observer, riseEquator.ra, riseEquator.dec, 'normal');
            }

            let setTime, setHorizon;
            if (set !== null) {
                setTime = set.date;
                const setEquator = Astronomy.Equator(objectName, setTime, observer, true, true);
                setHorizon = Astronomy.Horizon(setTime, observer, setEquator.ra, setEquator.dec, 'normal');
            }

            // Populate table row
            const td = '<td>';
            const td_nvt = '<td class="notvisibletoday">';
            const rise_vt = Math.abs(dayOffset(riseTime)) < 2;
            const set_vt = Math.abs(dayOffset(setTime)) < 2;
            row.innerHTML = `
                <td>${objectName}</td>
                <td>${phase}</td>
                ${rise ? (rise_vt ? td : td_nvt) + formatDateTime(riseTime, true) : td_nvt + riseStr}</td>
                ${rise_vt ? td + riseHorizon.azimuth.toFixed(0) + "°" : td_nvt}</td>
                ${visible ? td : td_nvt}${formatDateTime(transitTime, true)}</td>
                ${visible ? td : td_nvt}${transitHorizon.altitude.toFixed(0)}°</td>
                ${set ? (set_vt ? td : td_nvt) + formatDateTime(setTime, true) : td_nvt + setStr}</td>
                ${set_vt ? td + setHorizon.azimuth.toFixed(0) + "°" : td_nvt}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function setCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                latitudeInput.value = position.coords.latitude.toFixed(4);
                longitudeInput.value = position.coords.longitude.toFixed(4);
                clearAddress(); // TODO reverse geocoding ?
                updateEphemeris();
            }, error => {
                alert('Error getting location: ' + error.message);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function setCurrentDate() {
        if (latitudeInput.classList.contains('invalid') || longitudeInput.classList.contains('invalid')) return;

        const now = new Date();
        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const timeZone = tzlookup(latitude, longitude);
        const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });

        dateInput.value = dateFormat.format(now);
        updateEphemeris();
    }

    function triggerRefresh() {
        clearAddress(); // TODO reverse geocoding ?
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(updateEphemeris, 500);
    }

    function changeDate(days) {
        const currentDate = new Date(dateInput.value);
        currentDate.setUTCDate(currentDate.getUTCDate() + days);
        dateInput.value = currentDate.toISOString().slice(0, 10);
        updateEphemeris();
    }

    latitudeInput.addEventListener('input', triggerRefresh);
    longitudeInput.addEventListener('input', triggerRefresh);
    dateInput.addEventListener('input', updateEphemeris);

    currentLocationButton.addEventListener('click', setCurrentLocation);
    currentDateButton.addEventListener('click', setCurrentDate);

    const decreaseDateButton = document.getElementById('decrease-date');
    const increaseDateButton = document.getElementById('increase-date');
    decreaseDateButton.addEventListener('click', () => changeDate(-1));
    increaseDateButton.addEventListener('click', () => changeDate(1));


    // Initialize with current date
    setCurrentDate();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./serviceWorker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}


