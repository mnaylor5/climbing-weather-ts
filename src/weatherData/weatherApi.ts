export interface ClimbingArea {
    latitude: number;
    longitude: number; 
    name: string;
    climbingType?: string[];
}

export interface ClimbingAreaData {
    [key: string]: ClimbingArea;
}

export interface ForecastPeriod {
    number: number;
    name: string;
    startTime: string;
    endTime: string;
    isDaytime: boolean;
    temperature: number;
    temperatureUnit: string;
    temperatureTrend?: string;
    windSpeed: string;
    windDirection: string;
    icon: string;
    shortForecast: string;
    detailedForecast: string;
    probabilityOfPrecipitation?: {
        unitCode: string;
        value: number | null;
    };
    relativeHumidity?: {
        unitCode: string;
        value: number | null;
    };
}

export interface HourlyForecastData {
    startTime: string;
    endTime: string;
    temperature: number;
    temperatureUnit: string;
    windSpeed: string;
    windDirection: string;
    shortForecast: string;
    probabilityOfPrecipitation?: {
        unitCode: string;
        value: number | null;
    };
    relativeHumidity?: {
        unitCode: string;
        value: number | null;
    };
}

export interface WeatherApiLocationResponse {
    properties: {
        forecast: string;
        forecastHourly: string;
        forecastGridData: string;
    };
}

export interface ForecastResponse {
    properties: {
        periods: ForecastPeriod[];
    };
}

export interface HourlyForecastResponse {
    properties: {
        periods: HourlyForecastData[];
    };
}

// This function makes a call to the weather API using the latitude and longitude of a climbing area.
// The result of this call is essentially the details needed to make a second call to get the actual forecast, 
// distinguished by two different URLs stored in `properties.forecast` and `properties.forecastHourly`.
const weatherUrlBase = "https://api.weather.gov/points/";

export async function makeWeatherApiCall(
    latitude: number,
    longitude: number,
): Promise<WeatherApiLocationResponse>{
    const locationUrl = `${weatherUrlBase}${latitude},${longitude}`;
    const locationResponse = await fetch(locationUrl, {
        cache: 'no-store'
    });
    if (!locationResponse.ok) {
        throw new Error(`Error fetching location data for ${latitude},${longitude}: ${locationResponse.statusText}`);
    }
    return locationResponse.json();
}

export async function get12HourForecast(locationData: WeatherApiLocationResponse): Promise<ForecastResponse> {
    const forecastResponse = await fetch(locationData.properties.forecast, {
        cache: 'no-store'
    });
    if (!forecastResponse.ok) {
        throw new Error(`Error fetching 12-hour forecast: ${forecastResponse.statusText}`);
    }
    return forecastResponse.json();
}

export async function getHourlyForecast(locationData: WeatherApiLocationResponse): Promise<HourlyForecastResponse> {
    const forecastResponse = await fetch(locationData.properties.forecastHourly, {
        cache: 'no-store',
    });
    if (!forecastResponse.ok) {
        throw new Error(`Error fetching hourly forecast: ${forecastResponse.statusText}`);
    }
    return forecastResponse.json();
}

export async function getWeatherForArea(area: ClimbingArea, forecastType: 'hourly' | '12hour' = '12hour') {
    const locationData = await makeWeatherApiCall(area.latitude, area.longitude);
    
    if (forecastType === 'hourly') {
        return await getHourlyForecast(locationData);
    } else {
        return await get12HourForecast(locationData);
    }
}