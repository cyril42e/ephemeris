<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solar System Ephemeris</title>
    <link rel="stylesheet" href="styles.css">
    <script src="astronomy.browser.min.js"></script>
    <script src="script.js" defer></script>
</head>
<body>
    <h1>Solar System Ephemeris</h1>

    <div class="controls">
        <div class="position-controls">
            <label for="latitude">Latitude:</label>
            <input type="number" id="latitude" step="0.0001" value="48.8566">

            <label for="longitude">Longitude:</label>
            <input type="number" id="longitude" step="0.0001" value="2.3522">

            <label for="altitude">Altitude (m):</label>
            <input type="number" id="altitude" step="1" value="0">

            <button id="current-location">Use Current Location</button>
        </div>

        <div class="date-controls">
            <label for="date">Date:</label>
            <input type="date" id="date">

            <button id="current-date">Use Current Date</button>
        </div>
    </div>

    <div class="timeline-container">
        <div class="timeline-points top" id="morning-points-top"></div>
        <div class="timeline-periods-top" id="morning-periods-top"></div>
        <div class="timeline-periods-bottom" id="morning-periods-bottom"></div>
        <div class="timeline-points bottom" id="morning-points-bottom"></div>
        <!-- Populated here by JavaScript -->
    </div>
    <div class="timeline-container">
        <div class="timeline-points top" id="evening-points-top"></div>
        <div class="timeline-periods-top" id="evening-periods-top"></div>
        <div class="timeline-periods-bottom" id="evening-periods-bottom"></div>
        <div class="timeline-points bottom" id="evening-points-bottom"></div>
        <!-- Populated here by JavaScript -->
    </div>

    <table>
        <thead>
            <tr>
                <th>Object</th>
                <th></th>
                <th>Astronomical Dawn</th>
                <th>Nautical Dawn</th>
                <th>Civil Dawn</th>
                <th>Civil Dusk</th>
                <th>Nautical Dusk</th>
                <th>Astronomical Dusk</th>
            </tr>
        </thead>
        <tbody id="sun-dawn-dusk-row">
            <!-- Populated here by JavaScript -->
        </tbody>
        <thead>
            <tr>
                <th>Object</th>
                <th></th>
                <th>Blue Hour Begin</th>
                <th>Golden Hour Begin</th>
                <th>Golden Hour End</th>
                <th>Golden Hour Begin</th>
                <th>Blue Hour Begin</th>
                <th>Blue Hour End</th>
            </tr>
        </thead>
        <tbody id="sun-blue-golden-hour-row">
            <!-- Populated here by JavaScript -->
        </tbody>
        <thead>
            <tr>
                <th>Object</th>
                <th>Phase</th>
                <th>Rise Time</th>
                <th>Rise Azimuth</th>
                <th>Peak Elevation Time</th>
                <th>Peak Elevation</th>
                <th>Set Time</th>
                <th>Set Azimuth</th>
            </tr>
        </thead>
        <tbody id="ephemeris-table">
            <!-- Populated here by JavaScript -->
        </tbody>
    </table>
</body>
</html>
