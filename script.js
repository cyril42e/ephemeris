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
        if (point.time === '') {
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
    let refreshTimeout;

    function dayDistance(eventDate, referenceDate) {
        return Math.abs((eventDate - referenceDate) / (1000 * 60 * 60 * 24));
    }

    const timeFormat = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateFormat = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    function formatDateTime(eventDate, referenceDate, showDate = false) {
        const dayDist = dayDistance(eventDate, referenceDate);
        const time = timeFormat.format(eventDate);
        if (dayDist >= 1) {
            if (showDate) {
                const date = dateFormat.format(eventDate);
                return date + '\n' + time;
            } else {
                return '';
            }
        } else {
            return time;
        }
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
                        addressInput.value = suggestionText;
                        suggestionsDiv.innerHTML = '';
                        updateEphemeris();
                    });
                    suggestionsDiv.appendChild(suggestionItem);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    document.addEventListener('click', function(event) {
        if (event.target !== addressInput && event.target.className !== 'suggestion-item' && suggestionsDiv.innerHTML !== '') {
            suggestionsDiv.innerHTML = '';
            addressInput.value = '';
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

        // Calculate transit time
        const transitAfter = Astronomy.SearchHourAngle('Sun', observer, 0, civilNoon, +1).time.date;
        const transitBefore = Astronomy.SearchHourAngle('Sun', observer, 0, civilNoon, -1).time.date;
        let transit = transitAfter;
        if (dayDistance(transitBefore, civilNoon) < dayDistance(transitAfter, civilNoon)) {
            transit = transitBefore;
        }
        const solarNoon = transit; // use the solar noon when symmetry is required

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
            <td>Sun</td>
            <td></td>
            <td>${formatDateTime(astronomicalDawn, solarNoon)}</td>
            <td>${formatDateTime(nauticalDawn, solarNoon)}</td>
            <td>${formatDateTime(civilDawn, solarNoon)}</td>
            <td>${formatDateTime(civilDusk, solarNoon)}</td>
            <td>${formatDateTime(nauticalDusk, solarNoon)}</td>
            <td>${formatDateTime(astronomicalDusk, solarNoon)}</td>
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
            <td>Sun</td>
            <td></td>
            <td>${formatDateTime(blueHourBeginAsc, solarNoon)}</td>
            <td>${formatDateTime(goldenHourBeginAsc, solarNoon)}</td>
            <td>${formatDateTime(goldenHourEndAsc, solarNoon)}</td>
            <td>${formatDateTime(goldenHourBeginDesc, solarNoon)}</td>
            <td>${formatDateTime(blueHourBeginDesc, solarNoon)}</td>
            <td>${formatDateTime(blueHourEndDesc, solarNoon)}</td>
        `;
        sunBlueGoldenHourRow.appendChild(sunBlueGoldenHourRowContent);

        // Compute Sun rise and set time
        const sunRise = Astronomy.SearchRiseSet('Sun', observer, +1, solarNoon, -limitDays).date;
        const sunSet = Astronomy.SearchRiseSet('Sun', observer, -1, solarNoon, limitDays).date;

        const transitEquator = Astronomy.Equator('Sun', transit, observer, true, true);
        const transitHorizon = Astronomy.Horizon(transit, observer, transitEquator.ra, transitEquator.dec, 'normal');
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
        if (peakElevation > 0 && dayDistance(astronomicalDawn, solarNoon) > dayThreshold) {
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
        if (peakElevation < 6+2 && dayDistance(goldenHourEndAsc, solarNoon) > dayThreshold) {
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
            {name: 'Astro.\nDawn', time: formatDateTime(astronomicalDawn, solarNoon), class: '', position: astronomicalDawnM, arrow: 'center'},
            {name: 'Nautical\nDawn', time: formatDateTime(nauticalDawn, solarNoon), class: '', position: nauticalDawnM, arrow: 'center'},
            {name: 'Civil\nDawn', time: formatDateTime(civilDawn, solarNoon), class: '', position: civilDawnM, arrow: 'center'},
            {name: 'Sun\nRise', time: formatDateTime(sunRise, solarNoon), class: 'sun-event', position: sunRiseM, arrow: 'center'}
        ];

        const morningPointsBottom = [
            {name: '', time: formatDateTime(blueHourBeginAsc, solarNoon), class: '', position: blueHourStartM, arrow: 'right'},
            {name: '', time: formatDateTime(goldenHourBeginAsc, solarNoon), class: '', position: goldenHourStartM, arrow: 'left'},
            {name: '', time: formatDateTime(goldenHourEndAsc, solarNoon), class: '', position: goldenHourEndM, arrow: 'center'}
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
        if (peakElevation > 0 && dayDistance(astronomicalDusk, solarNoon) > dayThreshold) {
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
        if (peakElevation < 6+2 && dayDistance(goldenHourBeginDesc, solarNoon) > dayThreshold) {
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
            {name: 'Sun\nSet', time: formatDateTime(sunSet, solarNoon), class: 'sun-event', position: sunSetE, arrow: 'center'},
            {name: 'Civil\nDusk', time: formatDateTime(civilDusk, solarNoon), class: '', position: civilDuskE, arrow: 'center'},
            {name: 'Nautical\nDusk', time: formatDateTime(nauticalDusk, solarNoon), class: '', position: nauticalDuskE, arrow: 'center'},
            {name: 'Astro.\nDusk', time: formatDateTime(astronomicalDusk, solarNoon), class: '', position: astronomicalDuskE, arrow: 'center'}
        ];

        const eveningPointsBottom = [
            {name: '', time: formatDateTime(goldenHourBeginDesc, solarNoon), class: '', position: goldenHourStartE, arrow: 'center'},
            {name: '', time: formatDateTime(blueHourBeginDesc, solarNoon), class: '', position: goldenHourEndE, arrow: 'right'},
            {name: '', time: formatDateTime(blueHourEndDesc, solarNoon), class: '', position: civilDuskE, arrow: 'left'}
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
            let phase, riseTime, setTime, transitTime;
            if (objectName === 'Sun') {
            //const noon = objectName === 'Sun' ? solarNoon : civilNoon;
                phase = '';

                // Calculate rise and set times
                const rise = Astronomy.SearchRiseSet(objectName, observer, +1, solarNoon, -limitDays);
                if (rise === null) { console.log('No rise found for ' + objectName); return; }
                riseTime = rise.date;

                const set = Astronomy.SearchRiseSet(objectName, observer, -1, solarNoon, limitDays);
                if (set === null) { console.log('No set found for ' + objectName); return; }
                setTime = set.date;

                // Calculate transit time
                transitTime = transit; // get the closest to civil noon, already done above

            } else {
                // Calculate rise and set times
                let rise = Astronomy.SearchRiseSet(objectName, observer, +1, civil00h, 1); // no need to look for more than 1 day

                if (rise === null || rise.date >= civil24h) {
                    console.log(objectName, "no valid rise after 00h", rise);
                    rise = Astronomy.SearchRiseSet(objectName, observer, +1, civil24h, -limitDays);
                    if (rise === null) { console.log('No rise found for ' + objectName); return; }
                }
                riseTime = rise.date;

                const set = Astronomy.SearchRiseSet(objectName, observer, -1, riseTime, limitDays);
                if (set === null) { console.log('No set found for ' + objectName); return; }
                setTime = set.date;

                // Calculate transit time
                const transit = Astronomy.SearchHourAngle(objectName, observer, 0, riseTime, +1);
                if (transit === null) { console.log('No transit found for ' + objectName); return; }
                transitTime = transit.time.date;

                phase = `${(Astronomy.Illumination(objectName, transitTime).phase_fraction * 100).toFixed(0)}%`;
            }

            // Calculate azimuth and altitude
            const riseEquator = Astronomy.Equator(objectName, riseTime, observer, true, true);
            const riseHorizon = Astronomy.Horizon(riseTime, observer, riseEquator.ra, riseEquator.dec, 'normal');

            const transitEquator = Astronomy.Equator(objectName, transitTime, observer, true, true);
            const transitHorizon = Astronomy.Horizon(transitTime, observer, transitEquator.ra, transitEquator.dec, 'normal');

            const setEquator = Astronomy.Equator(objectName, setTime, observer, true, true);
            const setHorizon = Astronomy.Horizon(setTime, observer, setEquator.ra, setEquator.dec, 'normal');

            // Populate table row
            row.innerHTML = `
                <td>${objectName}</td>
                <td>${phase}</td>
                <td>${formatDateTime(riseTime, civilNoon, true)}</td>
                <td>${riseHorizon.azimuth.toFixed(0)}°</td>
                <td>${formatDateTime(transitTime, civilNoon, true)}</td>
                <td>${transitHorizon.altitude.toFixed(0)}°</td>
                <td>${formatDateTime(setTime, civilNoon, true)}</td>
                <td>${setHorizon.azimuth.toFixed(0)}°</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function setCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                latitudeInput.value = position.coords.latitude.toFixed(4);
                longitudeInput.value = position.coords.longitude.toFixed(4);
                addressInput.value = ''; // TODO reverse geocoding ?
                updateEphemeris();
            }, error => {
                alert('Error getting location: ' + error.message);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function setCurrentDate() {
        const now = new Date();
        dateInput.value = dateFormat.format(now);
        updateEphemeris();
    }

    function triggerRefresh() {
        addressInput.value = ''; // TODO reverse geocoding ?
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(updateEphemeris, 500);
    }

    function changeDate(days) {
        const currentDate = new Date(dateInput.value);
        currentDate.setDate(currentDate.getDate() + days);
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


