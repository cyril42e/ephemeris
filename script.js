document.addEventListener('DOMContentLoaded', function() {
    const observer = new Astronomy.Observer(48.8566, 2.3522, 46); // Coordinates for Paris
    const now = new Date();
    const limitDays = 300; // Number of days to search for rise/set events
    const objects = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const tableBody = document.getElementById('ephemeris-table');

    objects.forEach(objectName => {
        const row = document.createElement('tr');
        
        // Calculate ephemeris data
        const phase = objectName === 'Sun' ? '' : (Astronomy.Illumination(objectName, now).phase_fraction * 100).toFixed(2);

        // Calculate rise and set times
        const riseTime = Astronomy.SearchRiseSet(objectName, observer, +1, now, limitDays).date;
        const setTime = Astronomy.SearchRiseSet(objectName, observer, -1, now, limitDays).date;

        // Calculate transit time
        const transit = Astronomy.SearchHourAngle(objectName, observer, 0, now);
        const transitTime = transit.time.date;

        // Calculate dawn and dusk times for the Sun
        let astronomicalDawn = '';
        let nauticalDawn = '';
        let civilDawn = '';
        let civilDusk = '';
        let nauticalDusk = '';
        let astronomicalDusk = '';

        if (objectName === 'Sun') {
            astronomicalDawn = Astronomy.SearchAltitude(objectName, observer, +1, now, limitDays, -18).date.toLocaleTimeString();
            nauticalDawn = Astronomy.SearchAltitude(objectName, observer, +1, now, limitDays, -12).date.toLocaleTimeString();
            civilDawn = Astronomy.SearchAltitude(objectName, observer, +1, now, limitDays, -6).date.toLocaleTimeString();
            civilDusk = Astronomy.SearchAltitude(objectName, observer, -1, now, limitDays, -6).date.toLocaleTimeString();
            nauticalDusk = Astronomy.SearchAltitude(objectName, observer, -1, now, limitDays, -12).date.toLocaleTimeString();
            astronomicalDusk = Astronomy.SearchAltitude(objectName, observer, -1, now, limitDays, -18).date.toLocaleTimeString();
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
            <td>${astronomicalDawn}</td>
            <td>${nauticalDawn}</td>
            <td>${civilDawn}</td>
            <td>${riseTime.toLocaleTimeString()}</td>
            <td>${riseHorizon.azimuth.toFixed(2)}</td>
            <td>${transitTime.toLocaleTimeString()}</td>
            <td>${transitHorizon.azimuth.toFixed(2)}</td>
            <td>${transitHorizon.altitude.toFixed(2)}</td>
            <td>${setTime.toLocaleTimeString()}</td>
            <td>${setHorizon.azimuth.toFixed(2)}</td>
            <td>${civilDusk}</td>
            <td>${nauticalDusk}</td>
            <td>${astronomicalDusk}</td>
        `;
        tableBody.appendChild(row);
    });
});
