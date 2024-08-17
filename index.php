<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.5">
    <title>Solar System Ephemeris</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/luxon@3.5.0/build/global/luxon.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tz-lookup@6.1.25/tz.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js "></script>
    <link href=" https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css " rel="stylesheet">
    <script src="script.js" defer></script>
    <link rel="manifest" href="manifest.json">
</head>
<body>
<div class="page">
    <div class="title">
        <h1>Solar System Ephemeris</h1>
        <div class="links">
            <a href="https://github.com/cyril42e/ephemeris?tab=readme-ov-file#definitions">Documentation</a><br/>
            <a href="https://github.com/cyril42e/ephemeris">Source Code</a><br/>
            <a href="https://github.com/cyril42e/ephemeris/issues">Bug Reports</a><br/>
        </div>
    </div>

    <div class="controls">
        <div class="position-controls">
            <div class="address-container">
                <label for="address">Address:</label>
                <input type="text" id="address" autocomplete="off" value="Paris, France">
                <div id="suggestions"></div>
            </div>

            <label for="latitude">Latitude:</label>
            <input type="number" id="latitude" step="0.0001" value="48.8566">

            <label for="longitude">Longitude:</label>
            <input type="number" id="longitude" step="0.0001" value="2.3522">

            <button id="current-location">Current Location</button>
        </div>

        <div class="date-controls">
            <label for="date">Date:</label>
            <button id="decrease-date"><</button>
            <input type="text" id="date">
            <script>flatpickr("#date", {dateFormat: "Y-m-d", disableMobile: "true"});</script>
            <button id="increase-date">></button>

            <button id="current-date">Current Date</button>
        </div>
    </div>

    <div class="timeline">
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
</div>
</body>
</html>
