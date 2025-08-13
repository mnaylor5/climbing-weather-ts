import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherData } from '../useWeatherData';
import { getWeatherForArea } from '../../weatherData/weatherApi';

// Mock the weather API
jest.mock('../../weatherData/weatherApi', () => ({
  getWeatherForArea: jest.fn(),
}));

// Mock the data
jest.mock('../../weatherData/mockData', () => ({
  mockHourlyData: {
    properties: {
      periods: [
        {
          startTime: '2025-08-09T12:00:00-07:00',
          endTime: '2025-08-09T13:00:00-07:00',
          temperature: 75,
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'SW',
          shortForecast: 'Sunny',
        },
      ],
    },
  },
  mock12HourData: {
    properties: {
      periods: [
        {
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
        },
      ],
    },
  },
}));

const mockGetWeatherForArea = getWeatherForArea as jest.MockedFunction<typeof getWeatherForArea>;

describe('useWeatherData', () => {
  const mockAreas = {
    stonefort: {
      name: 'Stone Fort (Little Rock City)',
      latitude: 34.8944,
      longitude: -85.3294,
      climbingType: ['boulder'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useWeatherData());

    expect(result.current.weatherData).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchWeatherData).toBe('function');
  });

  it('fetches weather data successfully', async () => {
    const mockResponse = {
      properties: {
        periods: [
          {
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
          },
        ],
      },
    };

    mockGetWeatherForArea.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useWeatherData());

    await act(async () => {
      await result.current.fetchWeatherData(['stonefort'], '12hour', mockAreas);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weatherData).toHaveLength(1);
    expect(result.current.weatherData[0]).toEqual({
      areaKey: 'stonefort',
      areaName: 'Stone Fort (Little Rock City)',
      data: mockResponse,
    });
    expect(result.current.error).toBe(null);
  });

  it('handles API errors gracefully with mock data', async () => {
    mockGetWeatherForArea.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useWeatherData());

    await act(async () => {
      await result.current.fetchWeatherData(['stonefort'], '12hour', mockAreas);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.weatherData).toHaveLength(1);
    expect(result.current.weatherData[0].areaKey).toBe('stonefort');
    expect(result.current.weatherData[0].areaName).toBe('Stone Fort (Little Rock City)');
    expect(result.current.error).toBe(null);
  });

  it('sets loading state correctly', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetWeatherForArea.mockReturnValueOnce(promise as any);

    const { result } = renderHook(() => useWeatherData());

    act(() => {
      result.current.fetchWeatherData(['stonefort'], '12hour', mockAreas);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({
        properties: {
          periods: [],
        },
      });
      await promise;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('does nothing when no areas are selected', async () => {
    const { result } = renderHook(() => useWeatherData());

    await act(async () => {
      await result.current.fetchWeatherData([], '12hour', mockAreas);
    });

    expect(result.current.weatherData).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockGetWeatherForArea).not.toHaveBeenCalled();
  });
});