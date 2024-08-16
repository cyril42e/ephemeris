document.addEventListener('DOMContentLoaded', function() {
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
