import sample_climbing_areas from "../data/climbing-areas-v1.json";
import { getWeatherForArea, ClimbingAreaData } from "../src/weatherData/weatherApi";

console.log("sample_climbing_areas", sample_climbing_areas);

const areas = sample_climbing_areas as ClimbingAreaData;
const testArea = areas["nv_redrocks"];
console.log("Getting weather for", testArea.name);

// Test 12-hour forecast
console.log("\n--- Testing 12-hour forecast ---");
getWeatherForArea(testArea, '12hour')
    .then((forecastData) => {
        console.log("12-hour forecast periods:", forecastData.properties.periods.slice(0, 3));
    })
    .catch((error) => {
        console.error("Error fetching 12-hour weather data:", error);
    });

// Test hourly forecast
console.log("\n--- Testing hourly forecast ---");
getWeatherForArea(testArea, 'hourly')
    .then((forecastData) => {
        console.log("Hourly forecast periods:", forecastData.properties.periods.slice(0, 3));
    })
    .catch((error) => {
        console.error("Error fetching hourly weather data:", error);
    });

// Test the new Stone Fort area
console.log("\n--- Testing Stone Fort area ---");
const stoneFort = areas["tn_stonefortakalittlerockcity"];
console.log("Getting weather for", stoneFort.name);
getWeatherForArea(stoneFort, '12hour')
    .then((forecastData) => {
        console.log("Stone Fort forecast periods:", forecastData.properties.periods.slice(0, 2));
    })
    .catch((error) => {
        console.error("Error fetching Stone Fort weather data:", error);
    });

