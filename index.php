<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Astronomy Ephemeris</title>
    <link rel="stylesheet" href="styles.css">
    <script src="astronomy.browser.min.js"></script>
    <script src="script.js" defer></script>
</head>
<body>
    <h1>Astronomy Ephemeris</h1>
    
    <div class="controls">
        <label for="latitude">Latitude:</label>
        <input type="number" id="latitude" step="0.0001" value="48.8566">
        
        <label for="longitude">Longitude:</label>
        <input type="number" id="longitude" step="0.0001" value="2.3522">

        <label for="altitude">Altitude (m):</label>
        <input type="number" id="altitude" step="1" value="0">
        
        <button id="current-location">Use Current Location</button>
        
        <label for="datetime">Date & Time:</label>
        <input type="datetime-local" id="datetime">
        
        <button id="current-time">Use Current Time</button>
        
        <button id="update">Update Ephemeris</button>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Object</th>
                <th>Phase (%)</th>
                <th>Astronomical Dawn</th>
                <th>Nautical Dawn</th>
                <th>Civil Dawn</th>
                <th>Rise Time</th>
                <th>Rise Azimuth</th>
                <th>Peak Elevation Time</th>
                <th>Peak Elevation Azimuth</th>
                <th>Peak Elevation</th>
                <th>Set Time</th>
                <th>Set Azimuth</th>
                <th>Civil Dusk</th>
                <th>Nautical Dusk</th>
                <th>Astronomical Dusk</th>
            </tr>
        </thead>
        <tbody id="ephemeris-table">
            <!-- Data will be populated here by JavaScript -->
        </tbody>
    </table>
</body>
</html>
