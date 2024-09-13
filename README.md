# Solar System Ephemeris

## Presentation

This is the source code of the tool hosted at https://crteknologies.fr/tools/ephemeris.

It is a simple web page that displays:

- **a visual timeline of the day**: astronomical dawn, nautical dawn, civil dawn, sunrise, sunset, civil dusk, nautical dusk, astronomical dusk,
  as well as blue hour and golden hour in the morning and the evening.
- **the ephemeris table of the solar system objects** (Sun, Moon and planets):
  phase, rise time and azimuth, transit time and altitude, set time and azimut

You can choose the location with an address, coordinates, or your current location, as well as the date.

It is also a Progressive Web App (PWA), which can be used offline on a smartphone (open the page on your smartphone, and choose "Add to Home screen").

## Definitions

The visual timeline describes explicitly how the different concepts relate to each other. What can be precised is that:

- The rise and set are defined with the top of the Sun or Moon being visible, which means an elevation of around -0.8°
  by taking into account the object apparent size (around 0.25°) and the atmosphere refraction (around 0.55°).
- During civil twilight (after civil dawn or before civil dusk, when the sun is between elevation -6° and -0.8°),
  there is enough light to perform outdoor activities. It is not part of the civil night.
- During nautical twilight (after nautical dawn or before nautical dusk, when the sun is between elevation -12° and -6°),
  there is enough light to see the horizon between the sea and the sky. It is not part of the nautical night.
- During astronomical twilight (after astronomical dawn or before astronomical dusk, when the sun is between elevation -18° and -12°),
  there is too much light to see the faintest space objects. It is not part of the astronomical night.
- During the Golden Hour (when the sun is between elevation -6° and -4°),
  lighting is soft, diffused, with little contrast and warm color temperature, appreciated by photographers.
- During the Blue Hour (when the sun is between elevation -4° and +6°),
  lighting is soft, without direction and with cold color temperature, also appreciated by photographers.

## Usage

### Inputs

The ephemeris depends on two inputs: the location, and the date.

Setting the location can be done in multiple ways:

- by searching for an address in the 'Search address...' input field,
- by entering directly latitude and longitude coordinates in the corresponding input fields,
- by clicking on the 'Here' button to get automatically the current position of the device (you will need to accept
  permissions to access it).

Setting the date can also be done in multiple ways:

- by choosing a date in the calendar that opens when the date input field is clicked on,
- by incrementing or decrementing the day using the buttons on each side of the date input field,
- by clicking on the 'Now' button

### Interpretation

#### Time

All the dates and times (inputs and outputs) are expressed in the time zone corresponding to the input location (a.k.a. the target timezone):

- The date input is interpreted in the target timezone.
- The 'Now' button sets the current date in the target timezone.
- The times of the timeline and ephemeris table are expressed in the target timezone.

For clarity purposes, the target timezone is displayed at the top, along with its corresponding UTC offset and its offset compared
with the local (i.e. browser) timezone.

Only the transit time is guaranteed to be the requested day. The rise and set time may be the day before or after,
or even multiple days before or after in some cases.
When the object is visible at one moment during the day (especially at transit), the previous rise and the following set are displayed.
When the object is never visible during the day, the previous set and the following rise are displayed.
When an event does not happen during the requested day, but the day before or the day after, then the day offset is displayed after the corresponding time.
If the day offset is larger than one, then only the day offset is displayed, and appears grayed out, as well as associated data.
When this offset is larger than 300 days in the past, then '< -300' is displayed, or '> +300' in the future.

Note that time and dates always respect ISO conventions (24 hours, year-month-day).

The timeline bubbles are in general to scale, but with exceptions as a maximum bound is applied
in order to have a readable display for extreme cases, at higher latitudes
(for instance in Paris around the summer solstice, there is no astronomical night, only a 4.5 hours astronomical twilight).

#### Other data

The phase correponds to the phase fraction, i.e. the percentage of the object that appears illuminated by the Sun.
It is followed by an arrow that indicates whether it is increasing or decreasing.

For rise and set events, the azimuth at which it happens is also shown, which is the clockwise angle from North
(thus with 0° indicating North, and 90° indicating East).

For high point (i.e. transit), the reached elevation is also shown, which is the angle above the horizon.

The constellation in which each object can be found at the configured date is also shown, with a link to
https://www.heavens-above.com/ that allows to see where exactly in the constellation.

### Configuration

The interface language can be selected by clicking on the flag at the top left.

The book icon below the flag allows to enable or disable the display of constellation names with their scientific
(latin) name, instead of the current language.


## Technical explanations

The excellent [Astronomy Engine](https://github.com/cosinekitty/astronomy) library is used for all the computations.

## Limitations

TODO
