let portrait = false;

function createTimePeriods(containerId, data, totalDuration) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    let fill = false;
    if (totalDuration < 0) {
        fill = true;
        totalDuration = data.reduce((sum, item) => sum + item.duration, 0);
    }
    let current_start = 0;

    data.forEach(item => {
        if (item.duration == 0) {
            return;
        }
        const period = document.createElement('div');
        period.className = `period ${item.class}`;
        let start;
        if (fill) {
            start = current_start;
            current_start += item.duration;
        } else {
            start = item.start;
        }
        period.style.position = 'absolute';
        if (portrait) {
            period.innerHTML = item.name.replace(' ', '<br/>');
            period.style.top = `${(start / totalDuration) * 100}%`;
            period.style.height = `${(item.duration / totalDuration) * 100}%`;
            period.style.width = '100%';
        } else {
            period.textContent = item.name;
            period.style.left = `${(start / totalDuration) * 100}%`;
            period.style.width = `${(item.duration / totalDuration) * 100}%`;
            period.style.height = '100%';
        }
        start += item.duration;
        container.appendChild(period);
    });
}

function createTimePoints(containerId, points, totalDuration, minOffset, top) {
    const container = document.getElementById(containerId);
    while (container.firstChild) container.removeChild(container.lastChild);
    points.forEach(point => {
        // .time criterion is not sufficient due to +1/-1 that are sometimes legit, and sometimes not
        if (point.time === '' || point.position <= minOffset || point.position >= totalDuration - minOffset) {
            return;
        }
        const timePoint = document.createElement('div');
        timePoint.className = `time-point ${point.class}`;
        const name = point.name.replace(' ', '\n');
        if (top || portrait) {
            timePoint.innerHTML = name + (name === '' ? '' : '<br/>') + '<b class="bigger">' + point.time + '</b>';
        } else {
            timePoint.innerHTML = '<b class="bigger">' + point.time + '</b></br>' + name;
        }
        if (portrait) {
            timePoint.style.top = `${(point.position / totalDuration) * 100}%`;
            arrowPosition = (point.arrow === 'left') ? 35 : ((point.arrow === 'right') ? 65 : 50);
        } else {
            timePoint.style.left = `${(point.position / totalDuration) * 100}%`;
            arrowPosition = (point.arrow === 'left') ? 25 : ((point.arrow === 'right') ? 75 : 50);
        }
        timePoint.style.setProperty('--arrow-position', `${arrowPosition}%`);
        timePoint.addEventListener('mouseenter', bringToFront);
        timePoint.addEventListener('click', bringToFront);
        container.appendChild(timePoint);
    });
}

const translation_ui = {
  'en': {
    'title': 'Ephemeris',
    'stitle': 'Solar System',
    'languageDropdown': 'Language',
    'sciLanguageLabel': 'Using or not using scientific constellations names',
    'n': 'Night',
    'mad': 'Astro. Dawn',
    'mat': 'Astro. Twilight',
    'mnd': 'Nautical Dawn',
    'mnt': 'Nautical Twilight',
    'mcd': 'Civil Dawn',
    'mct': 'Civil Twilight',
    'sr': 'Sun Rise',
    'bh': 'Blue Hour',
    'gh': 'Golden Hour',
    'ss': 'Sun Set',
    'd': 'Day',
    'ecd': 'Civil Dusk',
    'ect': 'Civil Twilight',
    'end': 'Nautical Dusk',
    'ent': 'Nautical Twilight',
    'ead': 'Astro. Dusk',
    'eat': 'Astro. Twilight',
    'begin': 'Begin of',
    'endof': 'End of',
    'constel': 'Constellation',
    'phase': 'Phase',
    'rise': 'Rise',
    'peak': 'High',
    'set': 'Set',
    'rise_d': 'Rise Time and Azimuth',
    'peak_d': 'Culmination / High Point Time and Elevation',
    'set_d': 'Set Time and Azimuth',
    'now': 'Now',
    'here': 'Here',
    'local': 'local',
    'addr': 'Search address...',
    'doc': 'Documentation',
    'code': 'Source code',
    'bugs': 'Bug reports',
    'Sun': 'Sun',
    'Moon': 'Moon',
    'Mercury': 'Mercury',
    'Venus': 'Venus',
    'Mars': 'Mars',
    'Jupiter': 'Jupiter',
    'Saturn': 'Saturn',
    'Uranus': 'Uranus',
    'Neptune': 'Neptune'
  },
  'fr': {
    'title': 'Éphémérides',
    'stitle': 'Système solaire',
    'languageDropdown': 'Langue',
    'sciLanguageLabel': 'Utiliser ou non les noms scientifiques des constellations',
    'n': 'Nuit',
    'mad': '',
    'mat': 'Aube astro.',
    'mnd': '',
    'mnt': 'Aube nautique',
    'mcd': '',
    'mct': 'Aube civile',
    'sr': 'Lever Soleil',
    'bh': 'Heure bleue',
    'gh': 'Heure dorée',
    'ss': 'Coucher Soleil',
    'd': 'Jour',
    'ecd': '',
    'ect': 'Crépuscule civil',
    'end': '',
    'ent': 'Crépuscule nautique',
    'ead': '',
    'eat': 'Crépuscule astro.',
    'begin': 'Début de',
    'endof': 'Fin de',
    'constel': 'Constellation',
    'phase': 'Phase',
    'rise': 'Lever',
    'peak': 'Haut',
    'set': 'Coucher',
    'rise_d': 'Heure et azimut de lever',
    'peak_d': 'Heure et hauteur maximale',
    'set_d': 'Heure et azimut de coucher',
    'now': 'Maintenant',
    'here': 'Ici',
    'local': 'local',
    'addr': 'Chercher une addresse...',
    'doc': 'Documentation',
    'code': 'Code source',
    'bugs': 'Signaler un bug',
    'Sun': 'Soleil',
    'Moon': 'Lune',
    'Mercury': 'Mercure',
    'Venus': 'Vénus',
    'Mars': 'Mars',
    'Jupiter': 'Jupiter',
    'Saturn': 'Saturne',
    'Uranus': 'Uranus',
    'Neptune': 'Neptune'
  }
};

let tr = translation_ui['en'];

const translation_constel = {
  "sci": {
    "And": "Andromeda",
    "Ant": "Antlia",
    "Aps": "Apus",
    "Aqr": "Aquarius",
    "Aql": "Aquila",
    "Ara": "Ara",
    "Ari": "Aries",
    "Aur": "Auriga",
    "Boo": "Boötes",
    "Cae": "Caelum",
    "Cam": "Camelopardalis",
    "Cnc": "Cancer",
    "CVn": "Canes Venatici",
    "CMa": "Canis Major",
    "CMi": "Canis Minor",
    "Cap": "Capricornus",
    "Car": "Carina",
    "Cas": "Cassiopeia",
    "Cen": "Centaurus",
    "Cep": "Cepheus",
    "Cet": "Cetus",
    "Cha": "Chamaeleon",
    "Cir": "Circinus",
    "Col": "Columba",
    "Com": "Coma Berenices",
    "CrA": "Corona Austrina",
    "CrB": "Corona Borealis",
    "Crv": "Corvus",
    "Crt": "Crater",
    "Cru": "Crux",
    "Cyg": "Cygnus",
    "Del": "Delphinus",
    "Dor": "Dorado",
    "Dra": "Draco",
    "Equ": "Equuleus",
    "Eri": "Eridanus",
    "For": "Fornax",
    "Gem": "Gemini",
    "Gru": "Grus",
    "Her": "Hercules",
    "Hor": "Horologium",
    "Hya": "Hydra",
    "Hyi": "Hydrus",
    "Ind": "Indus",
    "Lac": "Lacerta",
    "Leo": "Leo",
    "LMi": "Leo Minor",
    "Lep": "Lepus",
    "Lib": "Libra",
    "Lup": "Lupus",
    "Lyn": "Lynx",
    "Lyr": "Lyra",
    "Men": "Mensa",
    "Mic": "Microscopium",
    "Mon": "Monoceros",
    "Mus": "Musca",
    "Nor": "Norma",
    "Oct": "Octans",
    "Oph": "Ophiuchus",
    "Ori": "Orion",
    "Pav": "Pavo",
    "Peg": "Pegasus",
    "Per": "Perseus",
    "Phe": "Phoenix",
    "Pic": "Pictor",
    "Psc": "Pisces",
    "PsA": "Piscis Austrinus",
    "Pup": "Puppis",
    "Pyx": "Pyxis",
    "Ret": "Reticulum",
    "Sge": "Sagitta",
    "Sgr": "Sagittarius",
    "Sco": "Scorpius",
    "Scl": "Sculptor",
    "Sct": "Scutum",
    "Ser": "Serpens Caput",
    "Ser": "Serpens Cauda",
    "Sex": "Sextans",
    "Tau": "Taurus",
    "Tel": "Telescopium",
    "Tri": "Triangulum",
    "TrA": "Triangulum Australe",
    "Tuc": "Tucana",
    "UMa": "Ursa Major",
    "UMi": "Ursa Minor",
    "Vel": "Vela",
    "Vir": "Virgo",
    "Vol": "Volans",
    "Vul": "Vulpecula",
  },
  "en": {
    "And": "Andromeda",
    "Ant": "Air Pump",
    "Aps": "Bird of Paradise",
    "Aqr": "Aquarius",
    "Aql": "Eagle",
    "Ara": "Altar",
    "Ari": "Ram",
    "Aur": "Charioteer",
    "Boo": "Herdsman",
    "Cae": "Graving tool",
    "Cam": "Giraffe",
    "Cnc": "Crab",
    "CVn": "Hunting Dogs",
    "CMa": "Great Dog",
    "CMi": "Little Dog",
    "Cap": "Capricorn",
    "Car": "Keel",
    "Cas": "Cassiopeia",
    "Cen": "Centaur",
    "Cep": "Cepheus",
    "Cet": "Whale",
    "Cha": "Chamaeleon",
    "Cir": "Compass",
    "Col": "Dove",
    "Com": "Berenice's Hair",
    "CrA": "Southern Crown",
    "CrB": "Northern Crown",
    "Crv": "Crow",
    "Crt": "Cup",
    "Cru": "Cross",
    "Cyg": "Swan",
    "Del": "Dolphin",
    "Dor": "Goldfish",
    "Dra": "Dragon",
    "Equ": "Colt",
    "Eri": "Eridanus",
    "For": "Furnace",
    "Gem": "Twins",
    "Gru": "Crane",
    "Her": "Hercules",
    "Hor": "Clock",
    "Hya": "Sea Serpent",
    "Hyi": "Hydrus",
    "Ind": "Indian",
    "Lac": "Lizard",
    "Leo": "Lion",
    "LMi": "Little Lion",
    "Lep": "Hare",
    "Lib": "Balance",
    "Lup": "Wolf",
    "Lyn": "Lynx",
    "Lyr": "Lyre",
    "Men": "Mensa",
    "Mic": "Microscope",
    "Mon": "Unicorn",
    "Mus": "Fly",
    "Nor": "Level",
    "Oct": "Octant",
    "Oph": "Ophiuchus",
    "Ori": "Orion",
    "Pav": "Peacock",
    "Peg": "Pegasus",
    "Per": "Perseus",
    "Phe": "Phoenix",
    "Pic": "Painter",
    "Psc": "Fishes",
    "PsA": "Southern Fish",
    "Pup": "Poop Deck",
    "Pyx": "Compass",
    "Ret": "Net",
    "Sge": "Arrow",
    "Sgr": "Archer",
    "Sco": "Scorpion",
    "Scl": "Sculptor",
    "Sct": "Shield",
    "Ser": "Serpent",
    "Ser": "Serpent",
    "Sex": "Sextant",
    "Tau": "Bull",
    "Tel": "Telescope",
    "Tri": "Triangle",
    "TrA": "Southern Triangle",
    "Tuc": "Toucan",
    "UMa": "Big Dipper",
    "UMi": "Little Dipper",
    "Vel": "Sails",
    "Vir": "Virgin",
    "Vol": "Flying Fish",
    "Vul": "Little Fox"
  },
  "fr": {
    "And": "Andromède",
    "Ant": "Machine Pneumatique",
    "Aps": "Oiseau de Paradis",
    "Aqr": "Verseau",
    "Aql": "Aigle",
    "Ara": "Autel",
    "Ari": "Bélier",
    "Aur": "Cocher",
    "Boo": "Bouvier",
    "Cae": "Burin",
    "Cam": "Girafe",
    "Cnc": "Cancer",
    "CVn": "Chiens de Chasse",
    "CMa": "Grand Chien",
    "CMi": "Petit Chien",
    "Cap": "Capricorne",
    "Car": "Carène",
    "Cas": "Cassiopée",
    "Cen": "Centaure",
    "Cep": "Céphée",
    "Cet": "Baleine",
    "Cha": "Caméléon",
    "Cir": "Compas",
    "Col": "Colombe",
    "Com": "Chevelure de Bérénice",
    "CrA": "Couronne Australe",
    "CrB": "Couronne Boréale",
    "Crv": "Corbeau",
    "Crt": "Coupe",
    "Cru": "Croix du Sud",
    "Cyg": "Cygne",
    "Del": "Dauphin",
    "Dor": "Dorade",
    "Dra": "Dragon",
    "Equ": "Petit Cheval",
    "Eri": "Eridan",
    "For": "Fourneau",
    "Gem": "Gémeaux",
    "Gru": "Grue",
    "Her": "Hercule",
    "Hor": "Horloge",
    "Hya": "Hydre Femelle",
    "Hyi": "Hydre Mâle",
    "Ind": "Indien",
    "Lac": "Lézard",
    "Leo": "Lion",
    "LMi": "Petit Lion",
    "Lep": "Lièvre",
    "Lib": "Balance",
    "Lup": "Loup",
    "Lyn": "Lynx",
    "Lyr": "Lyre",
    "Men": "Table",
    "Mic": "Microscope",
    "Mon": "Licorne",
    "Mus": "Mouche",
    "Nor": "Règle",
    "Oct": "Octant",
    "Oph": "Ophiuchus",
    "Ori": "Orion",
    "Pav": "Paon",
    "Peg": "Pégase",
    "Per": "Persée",
    "Phe": "Phénix",
    "Pic": "Peintre",
    "Psc": "Poissons",
    "PsA": "Poisson Austral",
    "Pup": "Poupe",
    "Pyx": "Boussole",
    "Ret": "Réticule",
    "Sge": "Flèche",
    "Sgr": "Sagittaire",
    "Sco": "Scorpion",
    "Scl": "Sculpteur",
    "Sct": "Écu de Sobieski",
    "Ser": "Serpent",
    "Ser": "Serpent",
    "Sex": "Sextant",
    "Tau": "Taureau",
    "Tel": "Télescope",
    "Tri": "Triangle",
    "TrA": "Triangle Austral",
    "Tuc": "Toucan",
    "UMa": "Grande Ourse",
    "UMi": "Petite Ourse",
    "Vel": "Voiles",
    "Vir": "Vierge",
    "Vol": "Poisson Volant",
    "Vul": "Petit Renard"
  }
};

let trc = translation_constel['en'];


function getLanguageBrowser() {
    const supportedLocales = ['en', 'fr'];
    const browserLocales = navigator.languages || [navigator.language || navigator.userLanguage];
    for (let locale of browserLocales) {
        const languageCode = locale.split('-')[0]; // Get the language code
        if (supportedLocales.includes(languageCode)) {
            return languageCode;
        }
    }
    return null;
}
const languageBrowser = getLanguageBrowser();

function getLanguageStorage() {
    return localStorage.getItem('language') || null;
}
function getSciLanguageStorage() {
    return localStorage.getItem('sciLanguage') || null;
}

function bringToFront(event) {
  // Remove 'front' class from all time points
  document.querySelectorAll('.time-point').forEach(point => {
    point.classList.remove('front');
  });
  // Add 'front' class to the hovered/clicked element
  event.currentTarget.classList.add('front');
}

const objects = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];


function buildEphemerisTableLandscape() {
    const tablep = document.getElementById('table_portrait');
    if (tablep) {
        tablep.remove();
    }
    const tablel = document.getElementById('table_landscape');
    if (tablel) {
       return;
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'table_landscape');

    // header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headerRow.innerHTML = `
            <th></th>
            <th class="constel">Constellation</th>
            <th class="phase">Phase</th>
            <th colspan="2" class="rise_d"><span class="rise">Rise</span> <span class="emoji">🕒</span>&nbsp;<span class="emoji">↔</span></th>
            <th colspan="2" class="peak_d"><span class="peak">High</span> <span class="emoji">🕒</span>&nbsp;<span class="emoji">↕</span></th>
            <th colspan="2" class="set_d" ><span class="set" >Set</span> <span class="emoji">🕒</span>&nbsp<span class="emoji">↔</span></th>
    `

    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    for (const obj of objects) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <th id="${obj}"></th>
            <td id="constel_${obj}"></td>
            <td id="phase_${obj}"></td>
            <td id="rise1_${obj}"></td>
            <td id="rise2_${obj}"></td>
            <td id="peak1_${obj}"></td>
            <td id="peak2_${obj}"></td>
            <td id="set1_${obj}"></td>
            <td id="set2_${obj}"></td>
        `
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    const page = document.getElementById('page');
    page.appendChild(table);
}

function buildEphemerisTablePortrait() {
    const tablel = document.getElementById('table_landscape');
    if (tablel) {
        tablel.remove();
    }
    const tablep = document.getElementById('table_portrait');
    if (tablep) {
        return;
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'table_portrait');

    for (const obj of objects) {
        // header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr><th></th><th colspan="2" id="${obj}"></th></tr>
        `
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.innerHTML = `
            <tr><th class="constel"></th>
                <td colspan="2" id="constel_${obj}"></td></tr>
            <tr><th class="phase"></th>
                <td colspan="2" id="phase_${obj}"></td></tr>
            <tr><th class="rise_d"><span class="rise"></span> <span class="emoji">🕒</span>&nbsp;<span class="emoji">↔</span></th>
                <td id="rise1_${obj}"></td>
                <td id="rise2_${obj}"></td></tr>
            <tr><th class="peak_d"><span class="peak"></span> <span class="emoji">🕒</span>&nbsp;<span class="emoji">↔</span></th>
                <td id="peak1_${obj}"></td>
                <td id="peak2_${obj}"></td></tr>
            <tr><th class="set_d"><span class="set"></span> <span class="emoji">🕒</span>&nbsp;<span class="emoji">↔</span></th>
                <td id="set1_${obj}"></td>
                <td id="set2_${obj}"></td></tr>
        `
        table.appendChild(tbody);
    }
    const page = document.getElementById('page');
    page.appendChild(table);
}

function switchMode() {
    const previous_portrait = portrait;
    //portrait = (window.innerHeight > window.innerWidth);
    portrait = (window.innerWidth < 700);

    if (portrait) {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
        buildEphemerisTablePortrait();
    } else {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
        buildEphemerisTableLandscape();
    }

    return portrait != previous_portrait;
}

document.addEventListener('DOMContentLoaded', function() {

    switchMode();

    function switchModeAndUpdate() {
        if (switchMode()) {
            applyTranslation();
            updateEphemeris();
        }
    }

    window.addEventListener('resize', switchModeAndUpdate);
    window.addEventListener('orientationchange', switchModeAndUpdate);

    const timelineTable = document.getElementById('timeline-table');
    timelineTable.style.display = "none";

    //***************************/
    // Controls

    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const dateInput = document.getElementById('date');
    const currentLocationButton = document.getElementById('current-location');
    const currentDateButton = document.getElementById('current-date');
    const addressInput = document.getElementById('address');
    const suggestionsDiv = document.getElementById('suggestions');
    const timezoneOutput = document.getElementById('timezone');
    const languageDropdown = document.getElementById('languageDropdown');
    const sciLanguageCheckbox = document.getElementById('sciLanguageCheckbox');
    let refreshTimeout;

    function applyTranslation() {
        currentLocationButton.textContent = tr.here;
        currentDateButton.textContent = tr.now;
        for(const s of ['title', 'stitle', 'doc', 'code', 'bugs']) {
            document.getElementById(s).textContent = tr[s];
        }
        for(const s of ['constel', 'phase', 'rise', 'peak', 'set']) {
            const elements = document.querySelectorAll('.' + s);
            for (const el of elements) {
                el.textContent = tr[s];
            }
        }
        for(const s of ['languageDropdown', 'sciLanguageLabel']) {
            document.getElementById(s).title = tr[s];
        }
        for(const s of ['rise_d', 'peak_d', 'set_d']) {
            const elements = document.querySelectorAll('.' + s);
            for (const el of elements) {
                el.title = tr[s];
            }
        }

        //if (addressInput.value === old) // TODO
    }

    function changeLanguage() {
        const selectedLanguage = languageDropdown.value;
        const selectedSciLanguage = sciLanguageCheckbox.checked === true ? 'sci' : selectedLanguage;

        // Save the language preference
        if (selectedLanguage === languageBrowser) {
            localStorage.removeItem('language');
        } else {
            localStorage.setItem('language', selectedLanguage);
        }
        if (sciLanguageCheckbox.checked) {
            localStorage.setItem('sciLanguage', true);
        } else {
            localStorage.removeItem('sciLanguage');
        }

        // Apply language
        tr = translation_ui[selectedLanguage];
        trc = translation_constel[selectedSciLanguage];

        applyTranslation();
        updateEphemeris();
    }
    languageDropdown.value = getLanguageStorage() || languageBrowser || 'en';
    languageDropdown.addEventListener('change', function() { changeLanguage(); });
    sciLanguageCheckbox.checked = getSciLanguageStorage() === "true" ? true : false;
    sciLanguageCheckbox.addEventListener('change', function() { changeLanguage(); });

    function clearAddress() {
        addressInput.value = tr.addr;
        addressInput.classList.add('empty');
    }
    function setAddress(text) {
        addressInput.value = text;
        addressInput.classList.remove('empty');
    }

    function dayDistance(eventDate, referenceDate) {
        return Math.abs((eventDate - referenceDate) / (1000 * 60 * 60 * 24));
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

    addressInput.addEventListener('focus', function() {
        if (addressInput.value === tr['addr']) {
            addressInput.value = '';
        }
        addressInput.classList.remove('empty');
    });

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
                        setAddress(suggestionText);
                        suggestionsDiv.innerHTML = '';
                        updateEphemeris();
                    });
                    suggestionsDiv.appendChild(suggestionItem);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    document.addEventListener('click', function(event) {
        if (event.target !== addressInput && event.target.className !== 'suggestion-item' && (suggestionsDiv.innerHTML !== '' || addressInput.value === '')) {
            suggestionsDiv.innerHTML = '';
            clearAddress();
        }
    });

    let lastScroll = 0;
    let lastScrollDown = true;
    const controlsDiv = document.getElementsByClassName('controls')[0];
    const controlsWDiv = document.getElementsByClassName('controls-wrapper')[0];

    // callback to hide/show controls when scrolling down/up
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const predictedScroll = currentScroll + (currentScroll - lastScroll);
        const scrollDown = currentScroll > lastScroll;
        // if change to scroll up, and controls are not visible, start making them appear
        if (!scrollDown && lastScrollDown && lastScroll > controlsDiv.offsetTop+controlsDiv.offsetHeight+controlsWDiv.offsetTop) {
            controlsWDiv.style.height = `${controlsDiv.offsetHeight}px`;
            controlsDiv.style.position = "absolute";
            controlsDiv.style.top = `${lastScroll-controlsDiv.offsetHeight-controlsWDiv.offsetTop}px`;
        }  else
        // if scrolling up, and controls are getting completely visible, stick it to the top (if it wasn't already)
        if (!scrollDown && predictedScroll <= controlsDiv.offsetTop+controlsWDiv.offsetTop && controlsDiv.style.position == "absolute") {
            controlsDiv.style.position = "fixed";
            controlsDiv.style.top = 0;
            controlsDiv.style.marginRight = "20px";
        } else
        // if change to scroll down and controls were sticky, anchor them to the page to allow them to progressively disappear
        if (scrollDown && !lastScrollDown && controlsDiv.style.position == "fixed") {
            controlsDiv.style.position = "absolute";
            controlsDiv.style.top = `${lastScroll-controlsWDiv.offsetTop}px`;
            controlsDiv.style.marginRight = "0";
        } else
        // if scrolling up and controls become above their nominal place, put them back at their nominal place
        if (!scrollDown && currentScroll <= controlsWDiv.offsetTop && controlsDiv.style.position != "static") {
            controlsDiv.style.position = "static";
            controlsDiv.style.marginRight = "0";
        }

        lastScroll = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
        lastScrollDown = scrollDown;
    });


    function updateEphemeris() {
        if (!validateInputs()) return;

        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const observer = new Astronomy.Observer(latitude, longitude, 0.0);

        // Set the time to noon
        const { DateTime } = luxon;
        const selectedDate = new Date(dateInput.value);
        const timeZone = tzlookup(latitude, longitude);

        const civil00h = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate()},
            {zone: timeZone}
        ).toJSDate();
        const civil24h = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate(),
            hour: 24},
            {zone: timeZone}
        ).toJSDate();
        const civilNoon = DateTime.fromObject({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1, // Luxon months are 1-indexed
            day: selectedDate.getDate(),
            hour: 12},
            {zone: timeZone}
        ).toJSDate();

        const timeFormat = new Intl.DateTimeFormat([], { timeZone: timeZone, hour: '2-digit', minute: '2-digit', hour12: false });

        function dayOffset(eventDate) {
            return Math.floor((eventDate - civil00h) / (1000 * 60 * 60 * 24));
        }

        function formatDateTime(eventDate, showDate = false) {
            const time = timeFormat.format(eventDate);
            const dayOff = dayOffset(eventDate);
            const dayOffStr = (dayOff > 0 ? '+' : '') + dayOff;
            if (Math.abs(dayOff) >= 1) {
                if (Math.abs(dayOff) < 2) {
                    return time + '&nbsp;' + dayOffStr;
                } else if (showDate) {
                    return dayOffStr;
                } else {
                    return '';
                }
            } else {
                return time;
            }
        }


        function getTimezoneOffset(date, timeZone) {
            const offsetFormat = new Intl.DateTimeFormat([], { timeZone: timeZone, timeZoneName: 'shortOffset' });
            let offset = offsetFormat.formatToParts(date).find(part => part.type === 'timeZoneName').value.slice(3);
            if (offset === '') {
                offset = '+0';
            }
            const match = offset.match(/([+-]?)(\d{1,2})(?::(\d{2}))?/);
            if (!match) {
                console.log('Invalid UTC offset format "' + offset + '" for time zone "' + timeZone + '"');
                return [offset, 0];
            }
            const sign = match[1] === '-' ? -1 : 1;
            const hours = parseInt(match[2], 10);
            const minutes = match[3] ? parseInt(match[3], 10) : 0;

            return [offset, sign * (hours * 60 + minutes)];
        }

        function formatOffset(diff) {
            const diffHours = Math.floor(Math.abs(diff) / 60);
            const diffMinutes = Math.abs(diff) % 60;
            const sign = diff >= 0 ? '+' : '-';

            const strMinutes = (diffMinutes !== 0 ? `:${diffMinutes.toString().padStart(2, '0')}` : '');
            return `${sign}${diffHours}${strMinutes}`;
        }

        const targetOffset = getTimezoneOffset(selectedDate, timeZone);
        const localOffset = getTimezoneOffset(selectedDate, undefined);
        const diff = formatOffset(targetOffset[1] - localOffset[1]);
        timezoneOutput.textContent = timeZone + ' (UTC' + targetOffset[0] + ' = ' + tr['local'] + diff + ')';

        // Calculate transit time
        function searchClosestTransit(object, date) {
            const transitAfter = Astronomy.SearchHourAngle(object, observer, 0, date, +1).time.date;
            const transitBefore = Astronomy.SearchHourAngle(object, observer, 0, date, -1).time.date;
            return ((civilNoon - transitBefore) < (transitAfter - civilNoon)) ? transitBefore : transitAfter;
        }
        const solarNoon = searchClosestTransit("Sun", civilNoon); // use the solar noon when symmetry is required

        const limitDays = 300; // Search within a wide range to handle polar regions
        const sunDawnDuskRow = document.getElementById('sun-dawn-dusk-row');
        const sunBlueGoldenHourRow = document.getElementById('sun-blue-golden-hour-row');

        sunDawnDuskRow.innerHTML = ''; // Clear previous sun dawn/dusk data
        sunBlueGoldenHourRow.innerHTML = ''; // Clear previous sun blue/golden hour data

        // Calculate dawn and dusk times for the Sun
        const astronomicalDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -18).date;
        const nauticalDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -12).date;
        const civilDawn = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -6).date;
        const civilDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -6).date;
        const nauticalDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -12).date;
        const astronomicalDusk = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -18).date;

        // Compute Sun rise and set time
        const sunRise = Astronomy.SearchRiseSet('Sun', observer, +1, solarNoon, -limitDays).date;
        const sunSet = Astronomy.SearchRiseSet('Sun', observer, -1, solarNoon, limitDays).date;
        const transitEquator = Astronomy.Equator('Sun', solarNoon, observer, true, true);
        const transitHorizon = Astronomy.Horizon(solarNoon, observer, transitEquator.ra, transitEquator.dec, 'normal');
        const peakElevation = transitHorizon.altitude;

        // Calculate blue and golden hour times for the Sun
        const blueHourBeginAsc = civilDawn;
        const goldenHourBeginAsc = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, -4).date;
        const goldenHourEndAsc = Astronomy.SearchAltitude('Sun', observer, +1, solarNoon, -limitDays, 6).date;
        const goldenHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, 6).date;
        const blueHourBeginDesc = Astronomy.SearchAltitude('Sun', observer, -1, solarNoon, limitDays, -4).date;
        const blueHourEndDesc = civilDusk;


        // Add morning row
        const sunDawnDuskRowContent = document.createElement('tr');
        sunDawnDuskRowContent.innerHTML = `
            <td>${formatDateTime(astronomicalDawn)}</td>
            <td>${formatDateTime(nauticalDawn)}</td>
            <td>${formatDateTime(civilDawn)}</td>
            <td>${formatDateTime(goldenHourBeginAsc)}</td>
            <td>${formatDateTime(sunRise)}</td>
            <td>${formatDateTime(goldenHourEndAsc)}</td>
        `;
        sunDawnDuskRow.appendChild(sunDawnDuskRowContent);

        // Add Sun blue and golden hour row
        const sunBlueGoldenHourRowContent = document.createElement('tr');
        sunBlueGoldenHourRowContent.innerHTML = `
            <td>${formatDateTime(goldenHourBeginDesc)}</td>
            <td>${formatDateTime(sunSet)}</td>
            <td>${formatDateTime(blueHourBeginDesc)}</td>
            <td>${formatDateTime(civilDusk)}</td>
            <td>${formatDateTime(nauticalDusk)}</td>
            <td>${formatDateTime(astronomicalDusk)}</td>
        `;
        sunBlueGoldenHourRow.appendChild(sunBlueGoldenHourRowContent);

        // Create timelines
        const extremitiesDuration = 20;
        const dashDuration = 3;
        const holeDuration = 1;
        const extDuration = extremitiesDuration - holeDuration - dashDuration;
        const minTimepointOffset = (holeDuration + dashDuration) * 2;
        const maxDuration = 120;
        const dayThreshold = 0.6;

        // Morning timeline data
        let offsetM = 0;
        let nightM = extDuration;
        let astronomicalTwilightM = Math.min((nauticalDawn-astronomicalDawn)/60000, maxDuration);
        let nauticalTwilightM = Math.min((civilDawn-nauticalDawn)/60000, maxDuration);
        let civilTwilightMr = (sunRise-civilDawn)/60000;
        let civilTwilightM = Math.min(civilTwilightMr, maxDuration);
        let blueHourM = ((goldenHourBeginAsc-blueHourBeginAsc)/60000) * civilTwilightM / civilTwilightMr; // scale like civilTwilight
        let goldenHourM = Math.min((goldenHourEndAsc-goldenHourBeginAsc)/60000, maxDuration);

        let dashTLM = 'night'; // Top Left Morning
        let dashTRM = 'day'; // Top Right Morning
        let dashBLM = 'invisible'; // Bottom Left Morning
        let dashBRM = 'invisible'; // Bottom Left Morning
        // check for missing periods when day is longer
        if (peakElevation > -12 && dayDistance(astronomicalDawn, solarNoon) > dayThreshold) {
            nightM = 0;
            astronomicalTwilightM = extDuration;
            offsetM = extDuration;
            dashTLM = 'astronomical-twilight';
            if (dayDistance(nauticalDawn, solarNoon) > dayThreshold) {
                astronomicalTwilightM = 0;
                nauticalTwilightM = extDuration;
                dashTLM = 'nautical-twilight'
                if (dayDistance(civilDawn, solarNoon) > dayThreshold) {
                    nauticalTwilightM = 0;
                    civilTwilightM = extDuration;
                    dashTLM = 'civil-twilight'
                    dashBLM = 'blue-hour'
                    if (dayDistance(goldenHourBeginAsc, solarNoon) > dayThreshold) {
                        blueHourM = 0;
                        dashBLM = 'golden-hour'
                        if (dayDistance(sunRise, solarNoon) > dayThreshold) {
                            civilTwilightM = 0;
                            dashTLM = 'day'
                            if (dayDistance(goldenHourEndAsc, solarNoon) > dayThreshold) {
                                goldenHourM = 0;
                                dashBLM = 'invisible';
                            }
                        }
                    }
                }
            }
        }

        let dayM = goldenHourM + blueHourM - civilTwilightM + extDuration;
        if (dayM == extDuration && civilTwilightM == 0.0) dayM = maxDuration*2;

        let offsetDM = 0; // Day Morning
        // check for missing periods when night is longer
        // fixme peakElevation threshold justification is not clear
        if (peakElevation < 12 && dayDistance(goldenHourEndAsc, solarNoon) > dayThreshold) {
            goldenHourM = civilTwilightM - blueHourM + extDuration;
            dayM = goldenHourM + blueHourM - civilTwilightM;
            dashBRM = 'golden-hour'
            if (dayDistance(sunRise, solarNoon) > dayThreshold) {
                dayM = 0;
                civilTwilightM = blueHourM + extDuration;
                dashTRM = 'civil-twilight';
                goldenHourM = extDuration;
                dashBRM = 'golden-hour';
                if (dayDistance(goldenHourBeginAsc, solarNoon) > dayThreshold) {
                    goldenHourM = 0;
                    civilTwilightM = extDuration;
                    blueHourM = extDuration;
                    dashBRM = 'blue-hour';
                    if (dayDistance(civilDawn, solarNoon) > dayThreshold) {
                        civilTwilightM = 0;
                        blueHourM = 0;
                        nauticalTwilightM = extDuration;
                        dashTRM = 'nautical-twilight'
                        dashBRM = 'invisible';
                        if (dayDistance(nauticalDawn, solarNoon) > dayThreshold) {
                            nauticalTwilightM = 0;
                            astronomicalTwilightM = maxDuration;
                            offsetM = -maxDuration + extDuration;
                            nightM = maxDuration;
                            dashTRM = 'astronomical-twilight'
                            if (dayDistance(astronomicalDawn, solarNoon) > dayThreshold) {
                                astronomicalTwilightM = 0;
                                nightM = maxDuration*2;
                                dashTRM = 'night'
                            }
                        }
                    }
                }
            }
        }

        const astronomicalDawnM = extremitiesDuration - offsetM;
        const nauticalDawnM = astronomicalDawnM + astronomicalTwilightM;
        const civilDawnM = nauticalDawnM + nauticalTwilightM;
        const sunRiseM = civilDawnM + civilTwilightM;
        const blueHourStartM = civilDawnM;
        const goldenHourStartM = civilDawnM + blueHourM;
        const goldenHourEndM = goldenHourStartM + goldenHourM;

        const morningPeriodsTop = [
            {name: '', class: dashTLM, duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: tr.n, class: 'night', duration: nightM},
            {name: tr.mat, class: 'astronomical-twilight', duration: astronomicalTwilightM},
            {name: tr.mnt, class: 'nautical-twilight', duration: nauticalTwilightM},
            {name: tr.mct, class: 'civil-twilight', duration: civilTwilightM},
            {name: tr.d, class: 'day', duration: dayM},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: dashTRM, duration: dashDuration},
            {name: '', class: 'invisible', duration: dashDuration + holeDuration}
        ];
        const morningTotalDuration = morningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);

        const morningPeriodsBottom = [
            {name: '', class: dashBLM, start: 0, duration: dashDuration},
            {name: tr.bh, class: 'blue-hour', start: blueHourStartM, duration: blueHourM},
            {name: tr.gh, class: 'golden-hour', start: goldenHourStartM, duration: goldenHourM},
            {name: '', class: dashBRM, start: morningTotalDuration - holeDuration - dashDuration*2, duration: dashDuration}
        ];

        const morningPointsTop = [
            {name: tr.mad, time: formatDateTime(astronomicalDawn), class: '', position: astronomicalDawnM, arrow: 'center'},
            {name: tr.mnd, time: formatDateTime(nauticalDawn), class: '', position: nauticalDawnM, arrow: 'center'},
            {name: tr.mcd, time: formatDateTime(civilDawn), class: '', position: civilDawnM, arrow: 'center'},
            {name: tr.sr, time: formatDateTime(sunRise), class: 'sun-event', position: sunRiseM, arrow: 'center'}
        ];

        const morningPointsBottom = [
            {name: '', time: formatDateTime(blueHourBeginAsc), class: '', position: blueHourStartM, arrow: 'right'},
            {name: '', time: formatDateTime(goldenHourBeginAsc), class: '', position: goldenHourStartM, arrow: 'left'},
            {name: '', time: formatDateTime(goldenHourEndAsc), class: '', position: goldenHourEndM, arrow: 'center'}
        ];

        // Evening timeline data
        let offsetE = 0;
        let nightE = extDuration;
        let astronomicalTwilightE = Math.min((astronomicalDusk-nauticalDusk)/60000, maxDuration);
        let nauticalTwilightE = Math.min((nauticalDusk-civilDusk)/60000, maxDuration);
        let civilTwilightEr = (civilDusk-sunSet)/60000;
        let civilTwilightE = Math.min(civilTwilightEr, maxDuration);
        let blueHourE = ((blueHourEndDesc-blueHourBeginDesc)/60000) * civilTwilightE / civilTwilightEr; // scale like civilTwilight
        let goldenHourE = Math.min((blueHourBeginDesc-goldenHourBeginDesc)/60000, maxDuration);

        let dashTLE = 'day'; // Top Left Evening
        let dashTRE = 'night'; // Top Right Evening
        let dashBLE = 'invisible'; // Bottom Left Evening
        let dashBRE = 'invisible'; // Bottom Right Evening
        // check for missing periods when day is longer
        if (peakElevation > -12 && dayDistance(astronomicalDusk, solarNoon) > dayThreshold) {
            nightE = 0;
            astronomicalTwilightE = extDuration;
            dashTRE = 'astronomical-twilight';
            if (dayDistance(nauticalDusk, solarNoon) > dayThreshold) {
                astronomicalTwilightE = 0;
                nauticalTwilightE = extDuration;
                dashTRE = 'nautical-twilight'
                if (dayDistance(civilDusk, solarNoon) > dayThreshold) {
                    nauticalTwilightE = 0;
                    civilTwilightE = extDuration;
                    dashTRE = 'civil-twilight'
                    dashBRE = 'blue-hour'
                    if (dayDistance(blueHourBeginDesc, solarNoon) > dayThreshold) {
                        blueHourE = 0;
                        dashBRE = 'golden-hour'
                        if (dayDistance(sunSet, solarNoon) > dayThreshold) {
                            civilTwilightE = 0;
                            dashTRE = 'day'
                            if (dayDistance(goldenHourBeginDesc, solarNoon) > dayThreshold) {
                                goldenHourE = 0;
                                dashBRE = 'invisible'
                                offsetE = extDuration;
                            }
                        }
                    }
                }
            }
        }

        let dayE = extDuration;

        let offsetGE = 0; // Golden Evening
        // check for missing periods when night is longer
        // fixme peakElevation threshold justification is not clear
        if (peakElevation < 12 && dayDistance(goldenHourBeginDesc, solarNoon) > dayThreshold) {
            goldenHourE = civilTwilightE - blueHourE + extDuration;
            offsetGE = extDuration - holeDuration - dashDuration;
            dashBLE = 'golden-hour'
            if (dayDistance(sunSet, solarNoon) > dayThreshold) {
                dayE = 0;
                civilTwilightE = extDuration + blueHourE;
                dashTLE = 'civil-twilight';
                goldenHourE = extDuration;
                dashBLE = 'golden-hour';
                if (dayDistance(blueHourBeginDesc, solarNoon) > dayThreshold) {
                    goldenHourE = 0;
                    civilTwilightE = extDuration;
                    blueHourE = extDuration;
                    dashBLE = 'blue-hour';
                    if (dayDistance(civilDusk, solarNoon) > dayThreshold) {
                        civilTwilightE = 0;
                        blueHourE = 0;
                        nauticalTwilightE = extDuration;
                        dashTLE = 'nautical-twilight'
                        dashBLE = 'invisible';
                        if (dayDistance(nauticalDusk, solarNoon) > dayThreshold) {
                            nauticalTwilightE = 0;
                            astronomicalTwilightE = maxDuration;
                            nightE = maxDuration;
                            dashTLE = 'astronomical-twilight'
                            if (dayDistance(astronomicalDusk, solarNoon) > dayThreshold) {
                                astronomicalTwilightE = 0;
                                nightE = maxDuration*2;
                                dashTLE = 'night'
                            }
                        }
                    }
                }
            }
        }

        const goldenHourStartE = extremitiesDuration - offsetE - offsetGE;
        const goldenHourEndE = goldenHourStartE + goldenHourE;
        const civilDuskE = goldenHourEndE + blueHourE;
        const nauticalDuskE = civilDuskE + nauticalTwilightE;
        const astronomicalDuskE = nauticalDuskE + astronomicalTwilightE;
        const sunSetE = civilDuskE - civilTwilightE;
        if (dayE != 0.0) dayE = goldenHourE == 0.0 ? maxDuration*2 : sunSetE - holeDuration*2 - dashDuration*2;

        const eveningPeriodsTop = [
            {name: '', class: 'invisible', duration: dashDuration + holeDuration},
            {name: '', class: dashTLE, duration: dashDuration},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: tr.d, class: 'day', duration: dayE},
            {name: tr.ect, class: 'civil-twilight', duration: civilTwilightE},
            {name: tr.ent, class: 'nautical-twilight', duration: nauticalTwilightE},
            {name: tr.eat, class: 'astronomical-twilight', duration: astronomicalTwilightE},
            {name: tr.n, class: 'night', duration: nightE},
            {name: '', class: 'invisible', duration: holeDuration},
            {name: '', class: dashTRE, duration: dashDuration}
        ];
        const eveningTotalDuration = eveningPeriodsTop.reduce((sum, item) => sum + item.duration, 0);

        const eveningPeriodsBottom = [
            {name: '', class: dashBLE, start: dashDuration + holeDuration, duration: dashDuration},
            {name: tr.gh, class: 'golden-hour', start: goldenHourStartE, duration: goldenHourE},
            {name: tr.bh, class: 'blue-hour', start: goldenHourEndE, duration: blueHourE},
            {name: '', class: dashBRE, start: eveningTotalDuration - dashDuration, duration: dashDuration}
        ];

        const eveningPointsTop = [
            {name: tr.ss, time: formatDateTime(sunSet), class: 'sun-event', position: sunSetE, arrow: 'center'},
            {name: tr.ecd, time: formatDateTime(civilDusk), class: '', position: civilDuskE, arrow: 'center'},
            {name: tr.end, time: formatDateTime(nauticalDusk), class: '', position: nauticalDuskE, arrow: 'center'},
            {name: tr.ead, time: formatDateTime(astronomicalDusk), class: '', position: astronomicalDuskE, arrow: 'center'}
        ];

        const eveningPointsBottom = [
            {name: '', time: formatDateTime(goldenHourBeginDesc), class: '', position: goldenHourStartE, arrow: 'center'},
            {name: '', time: formatDateTime(blueHourBeginDesc), class: '', position: goldenHourEndE, arrow: 'right'},
            {name: '', time: formatDateTime(blueHourEndDesc), class: '', position: civilDuskE, arrow: 'left'}
        ];

        createTimePeriods('morning-periods-top', morningPeriodsTop, -1);
        createTimePeriods('morning-periods-bottom', morningPeriodsBottom, morningTotalDuration);
        createTimePoints('morning-points-top', morningPointsTop, morningTotalDuration, minTimepointOffset, true);
        createTimePoints('morning-points-bottom', morningPointsBottom, morningTotalDuration, minTimepointOffset, false);

        createTimePeriods('evening-periods-top', eveningPeriodsTop, -1);
        createTimePeriods('evening-periods-bottom', eveningPeriodsBottom, eveningTotalDuration);
        createTimePoints('evening-points-top', eveningPointsTop, eveningTotalDuration, minTimepointOffset, true);
        createTimePoints('evening-points-bottom', eveningPointsBottom, eveningTotalDuration, minTimepointOffset, false);

        objects.forEach(objectName => {
            const row = document.createElement('tr');

            // Calculate ephemeris data

            // transit and phase
            let phase, transitTime;
            if (objectName === 'Sun') {
                transitTime = solarNoon;
                phase = '';
            } else {
                transitTime = searchClosestTransit(objectName, civilNoon);
                const pf = Astronomy.Illumination(objectName, transitTime).phase_fraction;
                const tomorrow = new Date(transitTime);
                tomorrow.setUTCDate(transitTime.getUTCDate()+1);
                const pf_t = Astronomy.Illumination(objectName, tomorrow).phase_fraction;
                phase = `${(pf * 100).toFixed(0)}%&nbsp;${pf_t>pf?'↗':'↘'}`;
            }
            const transitEquator = Astronomy.Equator(objectName, transitTime, observer, true, true);
            const transitHorizon = Astronomy.Horizon(transitTime, observer, transitEquator.ra, transitEquator.dec, 'normal');

            // rise and set
            let rise, set;
            let visible = true;
            let riseStr = '< -' + limitDays, setStr = '> +' + limitDays;
            if (transitHorizon.altitude > 0.0) { // visible
                // the object is for sure visible at transit, so look for rise in the past
                rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, -limitDays);
                set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, limitDays);
            } else {
                // the object may not be visible, so check it by looking for rise less than 1 day before
                rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, -1);
                if (rise === null) {
                    // the object is not visible, so get the last set and the next rise
                    set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, -limitDays);
                    rise = Astronomy.SearchRiseSet(objectName, observer, +1, transitTime, limitDays);
                    visible = false;
                    setStr = [riseStr, riseStr = setStr][0]; // swap
                } else {
                    set = Astronomy.SearchRiseSet(objectName, observer, -1, transitTime, limitDays);
                }
            }

            let riseTime, riseHorizon;
            if (rise !== null) {
                riseTime = rise.date;
                const riseEquator = Astronomy.Equator(objectName, riseTime, observer, true, true);
                riseHorizon = Astronomy.Horizon(riseTime, observer, riseEquator.ra, riseEquator.dec, 'normal');
            }

            let setTime, setHorizon;
            if (set !== null) {
                setTime = set.date;
                const setEquator = Astronomy.Equator(objectName, setTime, observer, true, true);
                setHorizon = Astronomy.Horizon(setTime, observer, setEquator.ra, setEquator.dec, 'normal');
            }

            // Constellation
            const constel = Astronomy.Constellation(transitEquator.ra, transitEquator.dec).symbol;

            // Populate table row
            document.getElementById(objectName).innerHTML = tr[objectName];
            document.getElementById('constel_' + objectName).innerHTML = `<a href="https://www.heavens-above.com/constellation.aspx?con=${constel}">${trc[constel]}</a>`;
            document.getElementById('phase_' + objectName).innerHTML = phase;

            function formatEvent(eventKey, event, event_vt, event_vta, eventTime, eventHorizon, eventStr) {
                tdr1 = document.getElementById(eventKey + '1_' + objectName);
                if (event) {
                    if (event_vt) tdr1.classList.remove('notvisibletoday'); else tdr1.classList.add('notvisibletoday');
                    tdr1.innerHTML = formatDateTime(eventTime, true);
                } else {
                    tdr1.classList.add('notvisibletoday');
                    tdr1.innerHTML = eventStr;
                }

                tdr2 = document.getElementById(eventKey + '2_' + objectName);
                if (event_vt) tdr2.classList.remove('notvisibletoday'); else tdr2.classList.add('notvisibletoday');
                tdr2.innerHTML = event_vta ? eventHorizon.toFixed(0) + "°" : "";
            }

            const rise_vt = Math.abs(dayOffset(riseTime)) < 2;
            const set_vt = Math.abs(dayOffset(setTime)) < 2;

            formatEvent('rise', rise, rise_vt, rise_vt, riseTime, rise_vt ? riseHorizon.azimuth : null, riseStr);
            formatEvent('peak', true, visible, true, transitTime, transitHorizon.altitude, '');
            formatEvent('set', set, set_vt, set_vt, setTime, set_vt ? setHorizon.azimuth : null, setStr);
        });
    }

    function setCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                latitudeInput.value = position.coords.latitude.toFixed(4);
                longitudeInput.value = position.coords.longitude.toFixed(4);
                clearAddress(); // TODO reverse geocoding ?
                updateEphemeris();
            }, error => {
                alert('Error getting location: ' + error.message);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function setCurrentDate() {
        if (latitudeInput.classList.contains('invalid') || longitudeInput.classList.contains('invalid')) return;

        const now = new Date();
        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const timeZone = tzlookup(latitude, longitude);
        const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });

        dateInput.value = dateFormat.format(now);
        updateEphemeris();
    }

    function triggerRefresh() {
        clearAddress(); // TODO reverse geocoding ?
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(updateEphemeris, 500);
    }

    function changeDate(days) {
        const currentDate = new Date(dateInput.value);
        currentDate.setUTCDate(currentDate.getUTCDate() + days);
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
    changeLanguage();
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


