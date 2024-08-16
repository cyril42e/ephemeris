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
    const altitudeInput = document.getElementById('altitude');
    const dateInput = document.getElementById('date');
    const currentLocationButton = document.getElementById('current-location');
    const currentDateButton = document.getElementById('current-date');
    let refreshTimeout;

    function formatDateTime(eventDate, referenceDate) {
        const dayDifference = (eventDate - referenceDate) / (1000 * 60 * 60 * 24);
        if (Math.abs(dayDifference) > 1) {
            return eventDate.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } else {
            return eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        if (altitudeInput.value === '') {
            altitudeInput.classList.add('invalid');
            valid = false;
        } else {
            altitudeInput.classList.remove('invalid');
        }

        if (dateInput.value === '') {
            dateInput.classList.add('invalid');
            valid = false;
        } else {
            dateInput.classList.remove('invalid');
        }

        return valid;
    }

    function updateEphemeris() {
        if (!validateInputs()) return;

        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const altitude = parseFloat(altitudeInput.value);
        const observer = new Astronomy.Observer(latitude, longitude, altitude);

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
        function offsetM(timePoint) {
             return (timePoint-astronomicalDawn)/60000 + extremitiesDuration;
        }
        function offsetE(timePoint) {
             return (timePoint-goldenHourBeginDesc)/60000 + extremitiesDuration;
        }

        // Morning timeline data
        const morningPeriodsTop = [
            {name: '', class: 'night', duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Night', class: 'night', duration: extremitiesDuration - holeDuration - dashDuration},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: (nauticalDawn-astronomicalDawn)/60000},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: (civilDawn-nauticalDawn)/60000},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: (sunRise-civilDawn)/60000},
            {name: 'Day', class: 'day', duration: (goldenHourEndAsc-sunRise)/60000 + extremitiesDuration - holeDuration*2 - dashDuration*2},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: 'day', duration: dashDuration},
            {name: '', class: 'invisible', duration: dashDuration+holeDuration}
        ];

        const morningPeriodsBottom = [
            {name: 'Blue Hour', class: 'blue-hour', start: offsetM(blueHourBeginAsc), duration: (goldenHourBeginAsc-blueHourBeginAsc)/60000},
            {name: 'Golden Hour', class: 'golden-hour', start: offsetM(goldenHourBeginAsc), duration: (goldenHourEndAsc-goldenHourBeginAsc)/60000}
        ];

        const morningPointsTop = [
            {name: 'Astro.\nDawn', time: formatDateTime(astronomicalDawn, noon), class: '', position: offsetM(astronomicalDawn), arrow: 'center'},
            {name: 'Nautical\nDawn', time: formatDateTime(nauticalDawn, noon), class: '', position: offsetM(nauticalDawn), arrow: 'center'},
            {name: 'Civil\nDawn', time: formatDateTime(civilDawn, noon), class: '', position: offsetM(civilDawn), arrow: 'center'},
            {name: 'Sun\nRise', time: formatDateTime(sunRise, noon), class: 'sun-event', position: offsetM(sunRise), arrow: 'center'}
        ];

        const morningPointsBottom = [
            {name: '', time: formatDateTime(blueHourBeginAsc, noon), class: '', position: offsetM(blueHourBeginAsc), arrow: 'right'},
            {name: '', time: formatDateTime(goldenHourBeginAsc, noon), class: '', position: offsetM(goldenHourBeginAsc), arrow: 'left'},
            {name: '', time: formatDateTime(goldenHourEndAsc, noon), class: '', position: offsetM(goldenHourEndAsc), arrow: 'center'}
        ];

        // Evening timeline data
        const eveningPeriodsTop = [
            {name: '', class: 'invisible', duration: dashDuration+holeDuration},
            {name: '', class: 'day', duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: 'Day', class: 'day', duration: (sunSet-goldenHourBeginDesc)/60000 + extremitiesDuration - holeDuration*2 - dashDuration*2},
            {name: 'Civil Twilight', class: 'civil-twilight', duration: (civilDusk-sunSet)/60000},
            {name: 'Nautical Twilight', class: 'nautical-twilight', duration: (nauticalDusk-civilDusk)/60000},
            {name: 'Astro. Twilight', class: 'astronomical-twilight', duration: (astronomicalDusk-nauticalDusk)/60000},
            {name: 'Night', class: 'night', duration: extremitiesDuration - holeDuration - dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: 'night', duration: dashDuration}
        ];

        const eveningPeriodsBottom = [
            {name: 'Golden Hour', class: 'golden-hour', start: offsetE(goldenHourBeginDesc), duration: (blueHourBeginDesc-goldenHourBeginDesc)/60000},
            {name: 'Blue Hour', class: 'blue-hour', start: offsetE(blueHourBeginDesc), duration: (blueHourEndDesc-blueHourBeginDesc)/60000}
        ];

        const eveningPointsTop = [
            {name: 'Sun\nSet', time: formatDateTime(sunSet, noon), class: 'sun-event', position: offsetE(sunSet), arrow: 'center'},
            {name: 'Civil\nDusk', time: formatDateTime(civilDusk, noon), class: '', position: offsetE(civilDusk), arrow: 'center'},
            {name: 'Nautical\nDusk', time: formatDateTime(nauticalDusk, noon), class: '', position: offsetE(nauticalDusk), arrow: 'center'},
            {name: 'Astro.\nDusk', time: formatDateTime(astronomicalDusk, noon), class: '', position: offsetE(astronomicalDusk), arrow: 'center'}
        ];

        const eveningPointsBottom = [
            {name: '', time: formatDateTime(goldenHourBeginDesc, noon), class: '', position: offsetE(goldenHourBeginDesc), arrow: 'center'},
            {name: '', time: formatDateTime(blueHourBeginDesc, noon), class: '', position: offsetE(blueHourBeginDesc), arrow: 'right'},
            {name: '', time: formatDateTime(blueHourEndDesc, noon), class: '', position: offsetE(blueHourEndDesc), arrow: 'left'}
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
                altitudeInput.value = position.coords.altitude ? position.coords.altitude.toFixed(0) : '0';
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
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(updateEphemeris, 500);
    }

    latitudeInput.addEventListener('input', triggerRefresh);
    longitudeInput.addEventListener('input', triggerRefresh);
    altitudeInput.addEventListener('input', triggerRefresh);
    dateInput.addEventListener('input', updateEphemeris);

    currentLocationButton.addEventListener('click', setCurrentLocation);
    currentDateButton.addEventListener('click', setCurrentDate);

    // Initialize with current date
    setCurrentDate();
});
