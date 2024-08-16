function createTimePeriodsTop(containerId, data) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    let totalDuration = data.reduce((sum, item) => sum + item.duration, 0);

    data.forEach(item => {
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

    function formatDateTime(eventDate, referenceDate) {
        const dayDifference = (eventDate - referenceDate) / (1000 * 60 * 60 * 24);
        const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (Math.abs(dayDifference) > 1) {
            const date = eventDate.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
            return date + '\n' + time;
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
        const selectedDate = new Date(dateInput.value);
        const noon = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12);

        const limitDays = 300; // Search within a wide range to handle polar regions
        const objects = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
        const sunDawnDuskRow = document.getElementById('sun-dawn-dusk-row');
        const sunBlueGoldenHourRow = document.getElementById('sun-blue-golden-hour-row');
        const tableBody = document.getElementById('ephemeris-table');

        sunDawnDuskRow.innerHTML = ''; // Clear previous sun dawn/dusk data
        sunBlueGoldenHourRow.innerHTML = ''; // Clear previous sun blue/golden hour data
        tableBody.innerHTML = ''; // Clear previous ephemeris data

        // Calculate dawn and dusk times for the Sun
        const astronomicalDawn = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, -18).date;
        const nauticalDawn = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, -12).date;
        const civilDawn = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, -6).date;
        const civilDusk = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, -6).date;
        const nauticalDusk = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, -12).date;
        const astronomicalDusk = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, -18).date;

        // Add Sun dawn and dusk row
        const sunDawnDuskRowContent = document.createElement('tr');
        sunDawnDuskRowContent.innerHTML = `
            <td>Sun</td>
            <td></td>
            <td>${formatDateTime(astronomicalDawn, noon)}</td>
            <td>${formatDateTime(nauticalDawn, noon)}</td>
            <td>${formatDateTime(civilDawn, noon)}</td>
            <td>${formatDateTime(civilDusk, noon)}</td>
            <td>${formatDateTime(nauticalDusk, noon)}</td>
            <td>${formatDateTime(astronomicalDusk, noon)}</td>
        `;
        sunDawnDuskRow.appendChild(sunDawnDuskRowContent);

        // Calculate blue and golden hour times for the Sun
        const blueHourBeginAsc = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, -6).date;
        const goldenHourBeginAsc = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, -4).date;
        const goldenHourEndAsc = Astronomy.SearchAltitude('Sun', observer, +1, noon, -limitDays, 6).date;
        const goldenHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, 6).date;
        const blueHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, -4).date;
        const blueHourEndDesc = Astronomy.SearchAltitude('Sun', observer, -1, noon, limitDays, -6).date;

        // Add Sun blue and golden hour row
        const sunBlueGoldenHourRowContent = document.createElement('tr');
        sunBlueGoldenHourRowContent.innerHTML = `
            <td>Sun</td>
            <td></td>
            <td>${formatDateTime(blueHourBeginAsc, noon)}</td>
            <td>${formatDateTime(goldenHourBeginAsc, noon)}</td>
            <td>${formatDateTime(goldenHourEndAsc, noon)}</td>
            <td>${formatDateTime(goldenHourBeginDesc, noon)}</td>
            <td>${formatDateTime(blueHourBeginDesc, noon)}</td>
            <td>${formatDateTime(blueHourEndDesc, noon)}</td>
        `;
        sunBlueGoldenHourRow.appendChild(sunBlueGoldenHourRowContent);

        // Compute Sun rise and set time
        const sunRise = Astronomy.SearchRiseSet('Sun', observer, +1, noon, -limitDays).date;
        const sunSet = Astronomy.SearchRiseSet('Sun', observer, -1, noon, limitDays).date;

        // Create timelines
        const extremitiesDuration = 20;
        const dashDuration = 3;
        const holeDuration = 1;
        const maxDuration = 120;

        // Morning timeline data
        const astronomicalTwilightM = Math.min((nauticalDawn-astronomicalDawn)/60000, maxDuration);
        const nauticalTwilightM = Math.min((civilDawn-nauticalDawn)/60000, maxDuration);
        const civilTwilightMr = (sunRise-civilDawn)/60000;
        const civilTwilightM = Math.min(civilTwilightMr, maxDuration);
        const blueHourM = ((goldenHourBeginAsc-blueHourBeginAsc)/60000) * civilTwilightM / civilTwilightMr; // scale like civilTwilight
        const goldenHourM = (goldenHourEndAsc-goldenHourBeginAsc)/60000 * civilTwilightM / civilTwilightMr; // scale like civilTwilight

        const morningPeriodsTop = [
            {name: '', class: 'night', duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Night', class: 'night', duration: extremitiesDuration - holeDuration - dashDuration},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: astronomicalTwilightM},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: nauticalTwilightM},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: civilTwilightM},
            {name: 'Day', class: 'day', duration: goldenHourM+blueHourM-civilTwilightM + extremitiesDuration - holeDuration*2 - dashDuration*2},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: 'day', duration: dashDuration},
            {name: '', class: 'invisible', duration: dashDuration+holeDuration}
        ];

        const morningPeriodsBottom = [
            {name: 'Blue Hour', class: 'blue-hour', start: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM, duration: blueHourM},
            {name: 'Golden Hour', class: 'golden-hour', start: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM+blueHourM, duration: goldenHourM}
        ];

        const morningPointsTop = [
            {name: 'Astro.\nDawn', time: formatDateTime(astronomicalDawn, noon), class: '', position: extremitiesDuration, arrow: 'center'},
            {name: 'Nautical\nDawn', time: formatDateTime(nauticalDawn, noon), class: '', position: extremitiesDuration+astronomicalTwilightM, arrow: 'center'},
            {name: 'Civil\nDawn', time: formatDateTime(civilDawn, noon), class: '', position: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM, arrow: 'center'},
            {name: 'Sun\nRise', time: formatDateTime(sunRise, noon), class: 'sun-event', position: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM+civilTwilightM, arrow: 'center'}
        ];

        const morningPointsBottom = [
            {name: '', time: formatDateTime(blueHourBeginAsc, noon), class: '', position: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM, arrow: 'right'},
            {name: '', time: formatDateTime(goldenHourBeginAsc, noon), class: '', position: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM+blueHourM, arrow: 'left'},
            {name: '', time: formatDateTime(goldenHourEndAsc, noon), class: '', position: extremitiesDuration+astronomicalTwilightM+nauticalTwilightM+blueHourM+goldenHourM, arrow: 'center'}
        ];

        // Evening timeline data
        const astronomicalTwilightE = Math.min((astronomicalDusk-nauticalDusk)/60000, maxDuration);
        const nauticalTwilightE = Math.min((nauticalDusk-civilDusk)/60000, maxDuration);
        const civilTwilightEr = (civilDusk-sunSet)/60000;
        const civilTwilightE = Math.min(civilTwilightEr, maxDuration);
        const blueHourE = ((blueHourEndDesc-blueHourBeginDesc)/60000) * civilTwilightE / civilTwilightEr; // scale like civilTwilight
        const goldenHourE = (blueHourBeginDesc-goldenHourBeginDesc)/60000 * civilTwilightE / civilTwilightEr; // scale like civilTwilight
        const sunSetE = extremitiesDuration+goldenHourE+blueHourE-civilTwilightE;

        const eveningPeriodsTop = [
            {name: '', class: 'invisible', duration: dashDuration+holeDuration},
            {name: '', class: 'day', duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Day', class: 'day', duration: sunSetE - holeDuration*2 - dashDuration*2},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: civilTwilightE},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: nauticalTwilightE},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: astronomicalTwilightE},
            {name: 'Night', class: 'night', duration: extremitiesDuration - holeDuration - dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: 'night', duration: dashDuration}
        ];

        const eveningPeriodsBottom = [
            {name: 'Golden Hour', class: 'golden-hour', start: extremitiesDuration, duration: goldenHourE},
            {name: 'Blue Hour', class: 'blue-hour', start: extremitiesDuration+goldenHourE, duration: blueHourE}
        ];

        const eveningPointsTop = [
            {name: 'Sun\nSet', time: formatDateTime(sunSet, noon), class: 'sun-event', position: sunSetE, arrow: 'center'},
            {name: 'Civil\nDusk', time: formatDateTime(civilDusk, noon), class: '', position: sunSetE+civilTwilightE, arrow: 'center'},
            {name: 'Nautical\nDusk', time: formatDateTime(nauticalDusk, noon), class: '', position: sunSetE+civilTwilightE+nauticalTwilightE, arrow: 'center'},
            {name: 'Astro.\nDusk', time: formatDateTime(astronomicalDusk, noon), class: '', position: sunSetE+civilTwilightE+nauticalTwilightE+astronomicalTwilightE, arrow: 'center'}
        ];

        const eveningPointsBottom = [
            {name: '', time: formatDateTime(goldenHourBeginDesc, noon), class: '', position: extremitiesDuration, arrow: 'center'},
            {name: '', time: formatDateTime(blueHourBeginDesc, noon), class: '', position: extremitiesDuration+goldenHourE, arrow: 'right'},
            {name: '', time: formatDateTime(blueHourEndDesc, noon), class: '', position: extremitiesDuration+goldenHourE+blueHourE, arrow: 'left'}
        ];

        const morningTotalDuration = morningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);
        const eveningTotalDuration = eveningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);

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
            const phase = objectName === 'Sun' ? '' : `${(Astronomy.Illumination(objectName, noon).phase_fraction * 100).toFixed(0)}%`;

            // Calculate rise and set times
            const riseTime = Astronomy.SearchRiseSet(objectName, observer, +1, noon, -limitDays).date;
            const setTime = Astronomy.SearchRiseSet(objectName, observer, -1, noon, limitDays).date;

            // Calculate transit time
            const transit = Astronomy.SearchHourAngle(objectName, observer, 0, noon);
            const transitTime = transit.time.date;

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
                <td>${formatDateTime(riseTime, noon)}</td>
                <td>${riseHorizon.azimuth.toFixed(0)}°</td>
                <td>${formatDateTime(transitTime, noon)}</td>
                <td>${transitHorizon.altitude.toFixed(0)}°</td>
                <td>${formatDateTime(setTime, noon)}</td>
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
        dateInput.value = now.toISOString().slice(0, 10);
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


