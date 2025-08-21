import { 
  makeWeatherApiCall, 
  get12HourForecast, 
  getHourlyForecast, 
  getWeatherForArea,
  ClimbingArea,
  WeatherApiLocationResponse,
  ForecastResponse,
  HourlyForecastResponse
} from '../weatherApi';

// Mock the global fetch function
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Weather API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('makeWeatherApiCall', () => {
    it('should make a successful API call and return location data', async () => {
      const mockLocationResponse: WeatherApiLocationResponse = {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
          forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLocationResponse),
      } as any);

      const result = await makeWeatherApiCall(36.1315, -115.4266);

      expect(fetch).toHaveBeenCalledWith('https://api.weather.gov/points/36.1315,-115.4266');
      expect(result).toEqual(mockLocationResponse);
    });

    it('should throw an error when the API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as any);

      await expect(makeWeatherApiCall(36.1315, -115.4266))
        .rejects
        .toThrow('Error fetching location data for 36.1315,-115.4266: Not Found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(makeWeatherApiCall(36.1315, -115.4266))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('get12HourForecast', () => {
    const mockLocationData: WeatherApiLocationResponse = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
        forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90'
      }
    };

    it('should fetch 12-hour forecast successfully', async () => {
      const mockForecastResponse: ForecastResponse = {
        properties: {
          periods: [
            {
              number: 1,
              name: 'Today',
              startTime: '2025-08-09T12:00:00-07:00',
              endTime: '2025-08-09T18:00:00-07:00',
              isDaytime: true,
              temperature: 85,
              temperatureUnit: 'F',
              windSpeed: '10 mph',
              windDirection: 'SW',
              icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
              shortForecast: 'Sunny',
              detailedForecast: 'Sunny skies with light winds.'
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockForecastResponse),
      } as any);

      const result = await get12HourForecast(mockLocationData);

      expect(fetch).toHaveBeenCalledWith(mockLocationData.properties.forecast, {
        cache: 'no-store'
      });
      expect(result).toEqual(mockForecastResponse);
    });

    it('should throw an error when 12-hour forecast fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      } as any);

      await expect(get12HourForecast(mockLocationData))
        .rejects
        .toThrow('Error fetching 12-hour forecast: Service Unavailable');
    });
  });

  describe('getHourlyForecast', () => {
    const mockLocationData: WeatherApiLocationResponse = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
        forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90'
      }
    };

    it('should fetch hourly forecast successfully', async () => {
      const mockHourlyResponse: HourlyForecastResponse = {
        properties: {
          periods: [
            {
              startTime: '2025-08-09T12:00:00-07:00',
              endTime: '2025-08-09T13:00:00-07:00',
              temperature: 85,
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
              }
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHourlyResponse),
      } as any);

      const result = await getHourlyForecast(mockLocationData);

      expect(fetch).toHaveBeenCalledWith(mockLocationData.properties.forecastHourly, {
        cache: 'no-store'
      });
      expect(result).toEqual(mockHourlyResponse);
    });

    it('should throw an error when hourly forecast fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as any);

      await expect(getHourlyForecast(mockLocationData))
        .rejects
        .toThrow('Error fetching hourly forecast: Internal Server Error');
    });
  });

  describe('getWeatherForArea', () => {
    const mockArea: ClimbingArea = {
      name: 'Red Rock Canyon',
      latitude: 36.1315,
      longitude: -115.4266,
      climbingType: ['sport', 'trad', 'bouldering']
    };

    const mockLocationResponse: WeatherApiLocationResponse = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/VEF/120,90/forecast/hourly',
        forecastGridData: 'https://api.weather.gov/gridpoints/VEF/120,90'
      }
    };

    it('should get 12-hour forecast by default', async () => {
      const mockForecastResponse: ForecastResponse = {
        properties: {
          periods: [
            {
              number: 1,
              name: 'Today',
              startTime: '2025-08-09T12:00:00-07:00',
              endTime: '2025-08-09T18:00:00-07:00',
              isDaytime: true,
              temperature: 85,
              temperatureUnit: 'F',
              windSpeed: '10 mph',
              windDirection: 'SW',
              icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
              shortForecast: 'Sunny',
              detailedForecast: 'Sunny skies with light winds.'
            }
          ]
        }
      };

      // Mock both API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockLocationResponse),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockForecastResponse),
        } as any);

      const result = await getWeatherForArea(mockArea);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.weather.gov/points/36.1315,-115.4266');
      expect(fetch).toHaveBeenNthCalledWith(2, mockLocationResponse.properties.forecast, {
        cache: 'no-store'
      });
      expect(result).toEqual(mockForecastResponse);
    });

    it('should get hourly forecast when specified', async () => {
      const mockHourlyResponse: HourlyForecastResponse = {
        properties: {
          periods: [
            {
              startTime: '2025-08-09T12:00:00-07:00',
              endTime: '2025-08-09T13:00:00-07:00',
              temperature: 85,
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
              }
            }
          ]
        }
      };

      // Mock both API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockLocationResponse),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockHourlyResponse),
        } as any);

      const result = await getWeatherForArea(mockArea, 'hourly');

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.weather.gov/points/36.1315,-115.4266');
      expect(fetch).toHaveBeenNthCalledWith(2, mockLocationResponse.properties.forecastHourly, {
        cache: 'no-store'
      });
      expect(result).toEqual(mockHourlyResponse);
    });

    it('should handle errors from location API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      } as any);

      await expect(getWeatherForArea(mockArea))
        .rejects
        .toThrow('Error fetching location data for 36.1315,-115.4266: Bad Request');
    });
  });
});
