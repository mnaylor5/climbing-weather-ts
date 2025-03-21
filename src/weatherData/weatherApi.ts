interface ClimbingArea {
    latitude: number;
    longitude: number; 
    name: string;
    id: string;
    climbingType?: string[]; // not sure how I'll actually want to use this, but I like the idea
}

interface ForecastResult {
    // tbd 
}

// This function makes a call to the weather API using the latitude and longitude of a climbing area.
// The result of this call is essentially the details needed to make a second call to get the actual forecast, 
// distinguished by two different URLs stored in `properties.forecast` and `properties.forecastHourly`.
const weatherUrlBase = "https://api.weather.gov/points/";
export async function makeWeatherApiCall( // side note: unsure if this should be exported or just used in the construction of a climbing area
    latitude: number,
    longitude: number,
): Promise<any>{

    const locationUrl = `${weatherUrlBase}${latitude},${longitude}`;
    const locationResponse = await fetch(locationUrl);
    if (!locationResponse.ok) {
        throw new Error(`Error fetching location data for ${latitude},${longitude}: ${locationResponse.statusText}`);
    }
    return locationResponse.json();
}