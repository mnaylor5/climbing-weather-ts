import { render, screen } from '@testing-library/react';
import ForecastTable from '../ForecastTable';
import { ForecastResponse } from '../../weatherData/weatherApi';

const mockForecastData: ForecastResponse = {
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
        detailedForecast: 'Sunny skies with light winds.',
        probabilityOfPrecipitation: {
          unitCode: 'wmoUnit:percent',
          value: 20
        },
        relativeHumidity: {
          unitCode: 'wmoUnit:percent',
          value: 45
        }
      },
      {
        number: 2,
        name: 'Tonight',
        startTime: '2025-08-09T18:00:00-07:00',
        endTime: '2025-08-10T06:00:00-07:00',
        isDaytime: false,
        temperature: 65,
        temperatureUnit: 'F',
        windSpeed: '5 mph',
        windDirection: 'W',
        icon: 'https://api.weather.gov/icons/land/night/clear?size=medium',
        shortForecast: 'Clear',
        detailedForecast: 'Clear skies overnight.',
        probabilityOfPrecipitation: {
          unitCode: 'wmoUnit:percent',
          value: null
        },
        relativeHumidity: {
          unitCode: 'wmoUnit:percent',
          value: 60
        }
      }
    ]
  }
};

// Helper function to create test data in the new format
const createTestWeatherData = (data: ForecastResponse, areaName = 'Test Area', areaKey = 'testarea') => {
  return [{
    areaKey,
    areaName,
    data
  }];
};

describe('ForecastTable', () => {
  it('renders the forecast table with correct title', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText('Daily Forecast - Test Area')).toBeInTheDocument();
  });

  it('renders tile layout instead of table headers', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    // Should not have table headers anymore
    expect(screen.queryByText('Period')).not.toBeInTheDocument();
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
    expect(screen.queryByText('Conditions')).not.toBeInTheDocument();
    expect(screen.queryByText('Precipitation')).not.toBeInTheDocument();
    expect(screen.queryByText('Wind')).not.toBeInTheDocument();
    
    // Should have tiles container
    const { container } = render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    expect(container.querySelector('.forecast-tiles-container')).toBeInTheDocument();
  });

  it('displays forecast periods correctly', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tonight')).toBeInTheDocument();
  });

  it('displays temperatures with correct units', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText('85°F')).toBeInTheDocument();
    expect(screen.getByText('65°F')).toBeInTheDocument();
  });

  it('displays weather conditions via emojis', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    // Should show weather emojis based on conditions
    const { container } = render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    const icons = container.querySelectorAll('.forecast-tile-icon');
    expect(icons.length).toBeGreaterThan(0);
    
    // Check that emojis are being used (sunny weather should show sun emoji)
    expect(icons[0].textContent).toMatch(/☀️|⛅|☁️|🌧️/);
  });

  it('displays wind information', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText(/Wind 10 mph SW/)).toBeInTheDocument();
    expect(screen.getByText(/Wind 5 mph W/)).toBeInTheDocument();
  });

  it('displays precipitation information correctly', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText('Precip. chance: 20%')).toBeInTheDocument();
    expect(screen.getByText('No precipitation data')).toBeInTheDocument();
  });

  it('applies correct CSS classes for day and night temperatures', () => {
    const { container } = render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    const temperatures = container.querySelectorAll('.temperature');
    expect(temperatures[0]).toHaveClass('high'); // Day temperature
    expect(temperatures[1]).toHaveClass('low');  // Night temperature
  });

  it('renders the informational note', () => {
    render(<ForecastTable weatherData={createTestWeatherData(mockForecastData)} />);
    
    expect(screen.getByText(/Forecast data provided by the National Weather Service/)).toBeInTheDocument();
  });

  it('limits display to 14 periods', () => {
    const manyPeriods: ForecastResponse = {
      properties: {
        periods: Array.from({ length: 20 }, (_, i) => ({
          number: i + 1,
          name: `Period ${i + 1}`,
          startTime: '2025-08-09T12:00:00-07:00',
          endTime: '2025-08-09T18:00:00-07:00',
          isDaytime: i % 2 === 0,
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
          }
        }))
      }
    };

    const { container } = render(<ForecastTable weatherData={createTestWeatherData(manyPeriods)} />);
    const tiles = container.querySelectorAll('.forecast-tile');
    expect(tiles).toHaveLength(14);
  });

  it('handles periods with null precipitation values', () => {
    const dataWithNullPrecip: ForecastResponse = {
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
            detailedForecast: 'Sunny skies.',
            probabilityOfPrecipitation: {
              unitCode: 'wmoUnit:percent',
              value: null
            }
          }
        ]
      }
    };

    render(<ForecastTable weatherData={createTestWeatherData(dataWithNullPrecip)} />);
    expect(screen.getByText('No precipitation data')).toBeInTheDocument();
  });
});
