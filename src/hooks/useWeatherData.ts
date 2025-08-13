import { useState, useCallback } from 'react';
import { ClimbingAreaData, getWeatherForArea, ForecastResponse, HourlyForecastResponse } from '../weatherData/weatherApi';
import { mockHourlyData, mock12HourData } from '../weatherData/mockData';

export interface AreaWeatherData {
  areaKey: string;
  areaName: string;
  data: ForecastResponse | HourlyForecastResponse;
}

export type ForecastType = 'hourly' | '12hour';

export interface UseWeatherDataReturn {
  weatherData: AreaWeatherData[];
  loading: boolean;
  error: string | null;
  fetchWeatherData: (selectedAreas: string[], forecastType: ForecastType, areas: ClimbingAreaData) => Promise<void>;
}

export const useWeatherData = (): UseWeatherDataReturn => {
  const [weatherData, setWeatherData] = useState<AreaWeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (
    selectedAreas: string[], 
    forecastType: ForecastType, 
    areas: ClimbingAreaData
  ) => {
    if (!selectedAreas.length) return;

    setLoading(true);
    setError(null);
    
    try {
      const weatherResults: AreaWeatherData[] = [];
      
      // Use Promise.all for concurrent API calls instead of sequential
      const weatherPromises = selectedAreas.map(async (areaKey) => {
        const area = areas[areaKey];
        if (area) {
          try {
            const data = await getWeatherForArea(area, forecastType);
            return {
              areaKey,
              areaName: area.name,
              data
            };
          } catch {
            // Use mock data when API fails for this area
            const mockData = forecastType === 'hourly' ? mockHourlyData : mock12HourData;
            return {
              areaKey,
              areaName: area.name,
              data: mockData as ForecastResponse | HourlyForecastResponse
            };
          }
        }
        return null;
      });

      const results = await Promise.all(weatherPromises);
      weatherResults.push(...results.filter((result): result is AreaWeatherData => result !== null));
      
      setWeatherData(weatherResults);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weatherData,
    loading,
    error,
    fetchWeatherData,
  };
};