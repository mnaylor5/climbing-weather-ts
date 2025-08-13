// Test utilities and helper functions
export const createMockClimbingArea = (overrides = {}) => ({
  name: 'Test Climbing Area',
  latitude: 40.0,
  longitude: -105.0,
  climbingType: ['sport', 'trad'],
  ...overrides,
});

export const createMockForecastPeriod = (overrides = {}) => ({
  number: 1,
  name: 'Today',
  startTime: '2025-08-09T12:00:00-07:00',
  endTime: '2025-08-09T18:00:00-07:00',
  isDaytime: true,
  temperature: 75,
  temperatureUnit: 'F',
  windSpeed: '10 mph',
  windDirection: 'SW',
  icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
  shortForecast: 'Sunny',
  detailedForecast: 'Sunny skies.',
  probabilityOfPrecipitation: {
    unitCode: 'wmoUnit:percent',
    value: 0
  },
  relativeHumidity: {
    unitCode: 'wmoUnit:percent',
    value: 45
  },
  ...overrides,
});

export const createMockHourlyPeriod = (overrides = {}) => ({
  startTime: '2025-08-09T12:00:00-07:00',
  endTime: '2025-08-09T13:00:00-07:00',
  temperature: 75,
  temperatureUnit: 'F',
  windSpeed: '10 mph',
  windDirection: 'SW',
  shortForecast: 'Sunny',
  probabilityOfPrecipitation: {
    unitCode: 'wmoUnit:percent',
    value: 0
  },
  relativeHumidity: {
    unitCode: 'wmoUnit:percent',
    value: 45
  },
  ...overrides,
});

import { ForecastPeriod, HourlyForecastData } from '../weatherData/weatherApi';

export const createMockApiResponse = (periods: ForecastPeriod[] | HourlyForecastData[]) => ({
  properties: {
    periods,
  },
});

export const createMockLocationResponse = (overrides = {}) => ({
  properties: {
    forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
    forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
    forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90',
    ...overrides,
  },
});

// Date utilities for testing
export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Validation utilities
export const isValidTemperature = (temp: number): boolean => {
  return temp >= -50 && temp <= 150; // Reasonable temperature range in Fahrenheit
};

export const isValidHumidity = (humidity: number | null): boolean => {
  if (humidity === null) return true;
  return humidity >= 0 && humidity <= 100;
};

export const isValidPrecipitation = (precipitation: number | null): boolean => {
  if (precipitation === null) return true;
  return precipitation >= 0 && precipitation <= 100;
};

export const isValidWindDirection = (direction: string): boolean => {
  const validDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return validDirections.includes(direction);
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Mock data generators for testing
export const generateMockForecastPeriods = (count: number, startDate = new Date()) => {
  return Array.from({ length: count }, (_, i) => {
    const isDaytime = i % 2 === 0;
    const date = addHours(startDate, i * 12);
    
    return createMockForecastPeriod({
      number: i + 1,
      name: isDaytime ? `Day ${Math.floor(i / 2) + 1}` : `Night ${Math.floor(i / 2) + 1}`,
      startTime: date.toISOString(),
      endTime: addHours(date, 12).toISOString(),
      isDaytime,
      temperature: isDaytime ? 75 + Math.random() * 15 : 55 + Math.random() * 10,
    });
  });
};

export const generateMockHourlyPeriods = (count: number, startDate = new Date()) => {
  return Array.from({ length: count }, (_, i) => {
    const date = addHours(startDate, i);
    
    return createMockHourlyPeriod({
      startTime: date.toISOString(),
      endTime: addHours(date, 1).toISOString(),
      temperature: 70 + Math.sin(i / 4) * 10, // Simulate temperature variation
    });
  });
};
