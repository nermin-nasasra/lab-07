'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
    response.send('Home Page!');
});
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);
////////////////////////////////////////////////////////////////////////////////////////////////


function locationHandler(request, response) {
    const city = request.query.city;
    superagent(
        `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
    )
        .then((res) => {
            const geoData = res.body;
            const locationData = new Location(city, geoData);
            response.status(200).json(locationData);
        })
        .catch((err) => errorHandler(err, request, response));
}

function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}
//////////////////////////////////////////////////////////////////////////////////////////////


function weatherHandler(request, response) {
    superagent(
        `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
        //`https://api.weatherbit.io/v2.0/history/daily?postal_code=27601&country=US&//start_date=2020-04-02&end_date=2020-04-03&key=API_KEY`
    )
        .then((weatherRes) => {
            const weatherSummaries = weatherRes.body.data.map((day) => {
                return new Weather(day);
            });
            response.status(200).json(weatherSummaries);
        })
        .catch((err) => errorHandler(err, request, response));
}
function Weather(day) {
    this.forecast = day.weather.description;
    this.time = new Date(day.valid_date).toString().slice(0, 15);
}


//////////////////////////////////////////////////////////////////////////////////////////////
function Trails(trial) {
    this.name = trial.name;
    this.location = trial.location;
    this.length = trial.length;
    this.stars = trial.stars;
    this.star_votes = trial.startVotes;
    this.summary = trial.summary;
    this.trail_url = trial.url;
    this.conditions = trial.conditionStatus;
    this.condition_date = traildata.conditionDate.toString().slice(0, 10);
    this.condition_time = traildata.conditionDate.toString().slice(11, 19);
}

app.get('/trails', trailsHandler);
function trailsHandler(request, response) {
    superagent(
        `https://www.hikingproject.com/data/get-trails?${request.query.trails.latitude}&&lon=${request.query.trails.longitude}&key=${process.env.TRAIL_API_KEY}`

    )
        .then((trailsRes) => {
            const trailSummaries = trailsRes.body.data.map((trial) => {
                return new Trails(trial);
            });
            response.status(200).json(trailSummaries);
        })
        .catch((err) => errorHandler(err, request, response));
}


////////////////////////////////////////////////////////////////////////////////////////////////

function notFoundHandler(request, response) {
    response.status(404).send('Sorry, something went wrong');
}


function errorHandler(error, request, response) {
    response.status(500).send(error);
}
app.listen(PORT, () => console.log(`the server is up and running on ${PORT}`));