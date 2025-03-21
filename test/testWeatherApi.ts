import sample_climbing_areas from "../data/sample-climbing-areas.json";
import { makeWeatherApiCall } from "../src/weatherData/weatherApi";

console.log("sample_climbing_areas", sample_climbing_areas);

const testArea = sample_climbing_areas["redrocks"];
console.log("Getting weather for", testArea.name);

makeWeatherApiCall(
    testArea.latitude,
    testArea.longitude
)
    .then((locationData) => {
        console.log("Fetching 12hr forecast data...");
        return fetch(locationData.properties.forecast);
    })
    .then((forecastResponse) => {
        if (!forecastResponse.ok) {
            throw new Error(`Error fetching forecast data: ${forecastResponse.statusText}`);
        }
        return forecastResponse.json();
    })
    .then((forecastData) => {
        console.log("Next 6 periods:", forecastData.properties.periods.slice(0, 6));
        return forecastData;
    })
    .catch((error) => {
        console.error("Error fetching weather data:", error);
    });

