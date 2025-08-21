import { 
  get12HourForecast, 
  getHourlyForecast,
  WeatherApiLocationResponse 
} from '../weatherApi';

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Weather API Cache Behavior', () => {
  const mockLocationData: WeatherApiLocationResponse = {
    properties: {
      forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
      forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
      forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Control Headers', () => {
    it('should use no-store cache policy for 12-hour forecast to prevent stale data', async () => {
      const mockResponse = {
        properties: {
          periods: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await get12HourForecast(mockLocationData);

      expect(fetch).toHaveBeenCalledWith(mockLocationData.properties.forecast, {
        cache: 'no-store'
      });
    });

    it('should use no-store cache policy for hourly forecast to prevent stale data', async () => {
      const mockResponse = {
        properties: {
          periods: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await getHourlyForecast(mockLocationData);

      expect(fetch).toHaveBeenCalledWith(mockLocationData.properties.forecastHourly, {
        cache: 'no-store'
      });
    });

    it('should make fresh requests for multiple calls to same forecast URL', async () => {
      const mockResponse = {
        properties: {
          periods: []
        }
      };

      // Mock two successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        } as any);

      // Make two calls to the same forecast
      await getHourlyForecast(mockLocationData);
      await getHourlyForecast(mockLocationData);

      // Both calls should be made (not cached)
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, mockLocationData.properties.forecastHourly, {
        cache: 'no-store'
      });
      expect(fetch).toHaveBeenNthCalledWith(2, mockLocationData.properties.forecastHourly, {
        cache: 'no-store'
      });
    });
  });
});