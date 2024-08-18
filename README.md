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

- During civil twilight (after civil dawn or before civil dusk, when the sun is between elevation -6° and 0°),
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

- by searching for an address in the 'Address' input field,
- by entering directly latitude and longitude coordinates in the corresponding input fields,
- by clicking on the 'Current Location' button to get automatically the current position of the device (you will need to accept
  permissions to access it).

Setting the date can also be done in multiple ways:

- by choosing a date in the calendar that opens when the date input field is clicked on,
- by incrementing or decrementing the day using the buttons on each side of the date input field,
- by clicking on the 'Current Date' button

### Interpretation

The date is interpreted in the time zone corresponding to the input location (it is necessary to have consistent sunrise and sunset corresponding to the same day).
So if you want the ephemeris for the 2024-08-16 in Paris,
you will get the sunrise for this day in Paris time zone, and the sunset for this day in Paris time zone, even if you are in San Francisco
where it will still be the 2024-08-15 when the sun rises in Paris.
For the Moon and planets, only the rise time is guaranteed to be the requested day, transit and set time may be the following day.

However the displayed timepoints are always provided in the time zone configured in the device with which you are loading the page.
Thus in our example if you are in San Francisco, you won't see that the sun rises at 06:45 Paris time in Paris, but at 21:45 San Francisco time,
so that you can compare it with the time provided by your device.

Note that time and dates always respect ISO conventions (24 hours, year-month-day).

The timeline bubbles are in general to scale, but with exceptions as a maximum bound is applied
in order to have a readable display for extreme cases, at higher latitudes
(for instance in Paris around the summer solstice, there is no astronomical night, only a 4.5 hours astronomical twilight).

## Technical explanations

The excellent [Astronomy Engine](https://github.com/cosinekitty/astronomy) library is used for all the computations.

## Limitations

TODO
