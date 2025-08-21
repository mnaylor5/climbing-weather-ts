import { render, screen } from '@testing-library/react';
import HourlyChart from '../HourlyChart';
import { HourlyForecastResponse } from '../../weatherData/weatherApi';

// Mock recharts to avoid issues with SVG rendering in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ formatter }: any) => {
    // Mock the legend with the formatter function if provided
    const items = ['Temperature (°F)', 'Humidity (%)', 'Precipitation (%)'];
    return (
      <div data-testid="legend">
        {items.map((item) => 
          <div key={item}>
            {formatter ? formatter(item) : <span>{item}</span>}
          </div>
        )}
      </div>
    );
  },
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const createMockHourlyData = (numPeriods: number = 48): HourlyForecastResponse => {
  const baseTime = new Date('2025-08-09T12:00:00-07:00');
  
  return {
    properties: {
      periods: Array.from({ length: numPeriods }, (_, i) => {
        const startTime = new Date(baseTime);
        startTime.setHours(startTime.getHours() + i);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
        
        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          temperature: 70 + (i % 24) * 0.5, // Varying temperature
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'SW',
          shortForecast: 'Sunny',
          probabilityOfPrecipitation: {
            unitCode: 'wmoUnit:percent',
            value: i % 5 === 0 ? 20 : null // Some periods have precipitation
          },
          relativeHumidity: {
            unitCode: 'wmoUnit:percent',
            value: 40 + (i % 10) * 2 // Varying humidity
          }
        };
      })
    }
  };
};

// Helper function to create test data in the new format
const createTestWeatherData = (data: HourlyForecastResponse, areaName = 'Test Area', areaKey = 'testarea') => {
  return [{
    areaKey,
    areaName,
    data
  }];
};

describe('HourlyChart', () => {
  let mockData: HourlyForecastResponse;

  beforeEach(() => {
    mockData = createMockHourlyData();
  });

  it('renders the hourly chart with correct title', () => {
    render(<HourlyChart weatherData={createTestWeatherData(mockData)} />);
    
    expect(screen.getByText('Test Area: Hourly Forecast')).toBeInTheDocument();
  });

  it('renders the chart components', () => {
    render(<HourlyChart weatherData={createTestWeatherData(mockData)} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-temperature')).toBeInTheDocument();
    expect(screen.getByTestId('line-humidity')).toBeInTheDocument();
    expect(screen.getByTestId('line-precipitation')).toBeInTheDocument();
  });

  it('renders the start time selector', () => {
    render(<HourlyChart weatherData={createTestWeatherData(mockData)} />);
    
    expect(screen.getByLabelText('Start Time:')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Now/)).toBeInTheDocument();
  });

  it('renders legend correctly', () => {
    render(<HourlyChart weatherData={createTestWeatherData(mockData)} />);
    
    expect(screen.getByText('Temperature (°F)')).toBeInTheDocument();
    expect(screen.getByText('Humidity (%)')).toBeInTheDocument();
    expect(screen.getByText('Precipitation (%)')).toBeInTheDocument();
  });

  it('handles multiple areas correctly', () => {
    const weatherData = [
      { areaKey: 'area1', areaName: 'Area 1', data: mockData },
      { areaKey: 'area2', areaName: 'Area 2', data: mockData }
    ];
    
    render(<HourlyChart weatherData={weatherData} />);
    
    expect(screen.getByText('Area 1: Hourly Forecast')).toBeInTheDocument();
    expect(screen.getByText('Area 2: Hourly Forecast')).toBeInTheDocument();
  });
});
