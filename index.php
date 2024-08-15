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
