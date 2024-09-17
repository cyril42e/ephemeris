<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solar System Ephemeris</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/luxon@3.5.0/build/global/luxon.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tz-lookup@6.1.25/tz.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js"></script>
    <link id="flatpickr-light-theme" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css" rel="stylesheet">
    <link id="flatpickr-dark-theme" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/themes/dark.min.css" rel="stylesheet" disabled>
    <script src="script.js" defer></script>
    <link rel="manifest" href="manifest.json">
</head>
<body>
<div id="page">
    <div class="title">
        <div class="settings-selector">
            <select id="languageDropdown" title="Language">
                <option value="en">&#x1F1EC;&#x1F1E7;</option>
                <option value="fr">&#x1F1EB;&#x1F1F7;</option>
            </select>
            <br/>
            <div class="menu-icon" id="settings-icon" title="Settings">
                &#x2699; <!-- Unicode character for the gear icon -->
            </div>
        </div>
        <div class="title-text">
            <h1 id="title">Ephemeris</h1>
            <br/>
            <h4 id="stitle">Solar System</h4>
        </div>
        <div class="navbar">
            <div class="menu-icon" id="nav-icon" title="Menu">
                &#x2261; <!-- Unicode character for the hamburger icon -->
            </div>
        </div>
    </div>

    <div class="nav-overlay" id="nav-overlay">
        <ul class="nav-links">
            <li><a id="doc" href="https://github.com/cyril42e/ephemeris?tab=readme-ov-file#definitions">Documentation</a><br/></li>
            <li><a id="code" href="https://github.com/cyril42e/ephemeris">Source Code</a><br/></li>
            <li><a id="bugs" href="https://github.com/cyril42e/ephemeris/issues">Bug Reports</a><br/></li>
            <li><a id="privacy" href="./privacy.php">Privacy Policy</a><br/></li>
        </ul>
    </div>
    <div class="settings-overlay" id="settings-overlay">
        <ul class="settings">
            <li>
                <label for="sciLanguageCheckbox" id="sciLanguageLabel">Show scientific constellations names</label>
                <input type="checkbox" id="sciLanguageCheckbox"></input>
            </li>
            <li>
                <label for="themeDropdown" id="themeLabel">Theme</label>
                <select id="themeDropdown" title="Theme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="default">Default</option>
                    <option value="auto">Auto</option>
                </select>
            </li>
        </ul>
    </div>

    <div class="controls-wrapper static">
    <div class="controls">
        <div class="position-controls">
            <div class="address-container">
                <input type="text" id="address" autocomplete="off" value="Paris, France">
                <div id="suggestions"></div>
            </div>

            <div class="coords-container">
                <input type="number" id="latitude" step="1.0" value="48.8566">
                <input type="number" id="longitude" step="1.0" value="2.3522">
                <button id="current-location">Here</button>
            </div>
        </div>

        <div class="date-controls">
            <div class="date-container">
                <button id="decrease-date"><</button>
                <input type="text" id="date">
                <script>flatpickr("#date", {dateFormat: "Y-m-d", disableMobile: "true"});</script>
                <button id="increase-date">></button>
                <button id="current-date">Now</button>
            </div>
            <div class="timezone-container">
                <label for="timezone" id="timezone"></label>
            </div>
        </div>
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

    <table id="timeline-table" style="display: none">
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
    <div id="table">
        <!-- Populated here by JavaScript -->
    </div>
    <div id="controls-scroller"></div>
</div>
</body>
</html>
