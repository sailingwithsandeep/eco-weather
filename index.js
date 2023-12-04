const ejs = require('ejs');
const fs = require('fs');
const { fetchWeatherApi } = require('openmeteo');

// app.get('/', (req, res) => {
//   // Data to pass to the template
//   const data = { message: 'Hello from Cloud Function!' };

//   // Read the EJS template file
//   fs.readFile('./index.html', 'utf8', (err, file) => {
//     if (err) {
//       res.status(500).send('Error loading template');
//       return;
//     }

//     // Render the template with the data
//     const html = ejs.render(file, data);

//     // Send the rendered HTML as a response
//     res.send(html);
//   });
// });

// app.post('/submit-weather-data', async (req, res) => {
//   const params = {
//     latitude: 52.52,
//     longitude: 13.41,
//     hourly: 'temperature_2m',
//   };
//   const url = 'https://api.open-meteo.com/v1/forecast';
//   const responses = await fetchWeatherApi(url, params);

//   // Helper function to form time ranges
//   const range = (start, stop, step) =>
//     Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

//   // Process first location. Add a for-loop for multiple locations or weather models
//   const response = responses[0];

//   // Attributes for timezone and location
//   const utcOffsetSeconds = response.utcOffsetSeconds();
//   const timezone = response.timezone();
//   const timezoneAbbreviation = response.timezoneAbbreviation();
//   const latitude = response.latitude();
//   const longitude = response.longitude();

//   const hourly = response.hourly();

//   // Note: The order of weather variables in the URL query and the indices below need to match!
//   const weatherData = {
//     hourly: {
//       time: range(
//         Number(hourly.time()),
//         Number(hourly.timeEnd()),
//         hourly.interval()
//       ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
//       temperature2m: hourly.variables(0).valuesArray(),
//     },
//   };

//   //   // `weatherData` now contains a simple structure with arrays for datetime and weather data
//   //   for (let i = 0; i < weatherData.hourly.time.length; i++) {
//   //     console.log(
//   //       weatherData.hourly.time[i].toISOString(),
//   //       weatherData.hourly.temperature2m[i]
//   //     );
//   //   }

//   res.send(weatherData);
// });

// app.use('*', (req, res) => {
//   res.status(404);
//   return res.send({
//     message: 'Invalid URL',
//   });
// });

// const server = http.createServer(app);

// server.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
const functions = require('@google-cloud/functions-framework');

functions.http('helloWorld', (req, res) => {
  const data = { message: 'Hello from Cloud Function!' };
  // Read the EJS template file
  fs.readFile('./index.html', 'utf8', (err, file) => {
    if (err) {
      res.status(500).send('Error loading template');
      return;
    }
    // Render the template with the data
    const html = ejs.render(file, data);
    // Send the rendered HTML as a response
    res.send(html);
  });
});

functions.http('submit-weather-data', async (req, res) => {
  const params = {
    latitude: 52.52,
    longitude: 13.41,
    hourly: 'temperature_2m',
  };
  const url = 'https://api.open-meteo.com/v1/forecast';
  const responses = await fetchWeatherApi(url, params);
  // Helper function to form time ranges
  const range = (start, stop, step) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];
  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const latitude = response.latitude();
  const longitude = response.longitude();
  const hourly = response.hourly();
  // Note: The order of weather variables in the URL query and the indices below need to match!
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
  //   // `weatherData` now contains a simple structure with arrays for datetime and weather data
  //   for (let i = 0; i < weatherData.hourly.time.length; i++) {
  //     console.log(
  //       weatherData.hourly.time[i].toISOString(),
  //       weatherData.hourly.temperature2m[i]
  //     );
  //   }
  res.send(weatherData);
});
