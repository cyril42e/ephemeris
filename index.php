<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.6">
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
        <h1 id="title">Solar System Ephemeris</h1>
        <div class="links">
            <a id="doc" href="https://github.com/cyril42e/ephemeris?tab=readme-ov-file#definitions">Documentation</a><br/>
            <a id="code" href="https://github.com/cyril42e/ephemeris">Source Code</a><br/>
            <a id="bugs" href="https://github.com/cyril42e/ephemeris/issues">Bug Reports</a><br/>
        </div>
    </div>

    <div class="controls">
        <div class="position-controls">
            <div class="address-container">
                <input type="text" id="address" autocomplete="off" value="Paris, France">
                <div id="suggestions"></div>
            </div>

            <input type="number" id="latitude" step="1.0" value="48.8566">
            <input type="number" id="longitude" step="1.0" value="2.3522">

            <button id="current-location">Here</button>
        </div>

        <div class="date-controls">
            <button id="decrease-date"><</button>
            <input type="text" id="date">
            <script>flatpickr("#date", {dateFormat: "Y-m-d", disableMobile: "true"});</script>
            <button id="increase-date">></button>

            <button id="current-date">Now</button>
            <label for="timezone" id="timezone"></label>
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
                <th>🔭 ↦</th>
                <th>🛥 ↦</th>
                <th>🏠🔵 ↦</th>
                <th>↤ 🔵 🟠 ↦</th>
                <th>↤ 🏠  🟡↑</th>
                <th>↤ 🟠</th>
            </tr>
        </thead>
        <tbody id="sun-dawn-dusk-row">
            <!-- Populated here by JavaScript -->
        </tbody>
        <thead>
            <tr>
                <th>🟠 ↦</th>
                <th>🟡↓  🏠 ↦</th>
                <th>↤ 🟠 🔵 ↦</th>
                <th>↤ 🔵🏠</th>
                <th>↤ 🛥</th>
                <th>↤ 🔭</th>
            </tr>
        </thead>
        <tbody id="sun-blue-golden-hour-row">
            <!-- Populated here by JavaScript -->
        </tbody>
    </table>
    <table>
        <thead>
            <tr>
                <th></th>
                <th id="phase">Phase</th>
                <th colspan="2"><span id="rise">Rise</span> 🕒&nbsp;⬌</th>
                <th colspan="2"><span id="peak">High</span> 🕒&nbsp;⬍</th>
                <th colspan="2"><span id="set">Set</span> 🕒&nbsp;⬌</th>
            </tr>
        </thead>
        <tbody id="ephemeris-table">
            <!-- Populated here by JavaScript -->
        </tbody>
    </table>
</div>
</body>
</html>
