const fs = require('fs');
const ejs = require('ejs');
const functions = require('@google-cloud/functions-framework');
const { fetchWeatherApi } = require('openmeteo');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

functions.http('submit-weather-data', async (req, res) => {
  try {
    if (!req.body.latitude && !req.body.longitude) {
      const file = fs.readFileSync('./index.html', 'utf8');
      // Render the template with the data
      const html = ejs.render(file, { message: 'Please enter a location' });
      console.log('index file');

      // Send the rendered HTML as a response
      res.send(html);
    }

    fs.readFile('./graph.html', 'utf8', async (err, file) => {
      if (err) {
        res.status(500).send('Error loading template');
        return;
      }

      // Render the template with the data
      const params = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        hourly: 'temperature_2m',
        timezone: 'Asia/Tokyo',
      };
      const url = 'https://api.open-meteo.com/v1/forecast';
      const responses = await fetchWeatherApi(url, params);
      // Helper function to form time ranges
      const range = (start, stop, step) =>
        Array.from(
          { length: (stop - start) / step },
          (_, i) => start + i * step
        );
      // Process first location. Add a for-loop for multiple locations or weather models
      const response = responses[0];
      // Attributes for timezone and location
      const utcOffsetSeconds = response.utcOffsetSeconds();

      const hourly = response.hourly();

      const weatherData = {
        hourly: {
          time: range(
            Number(hourly.time()),
            Number(hourly.timeEnd()),
            hourly.interval()
          ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
          temperature2m: hourly.variables(0).valuesArray(),
        },
      };

      const time = weatherData.hourly.time.map((t) =>
        t.toISOString().replace(/T.*/, '')
      );

      const temperature2m = weatherData.hourly.temperature2m;

      // const document = firestore.doc('ecotraxk/weather_data');

      // Enter new data into the document.
      // await document.set({
      //   aTime: time,
      //   aTemperature: temperature2m,
      //   created_at: new Date(),
      // });

      console.log('Entered new data into the document');

      const html = ejs.render(file, { time, temperature2m });

      res.send(html);
    });
  } catch (error) {
    console.error('Error!!!!!!!!!!!!!!!!!!!!!!!!!\n', error);
  }
});
