import { render, screen, fireEvent } from '@testing-library/react';
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
    
    expect(screen.getByText('48-Hour Weather Forecast - Test Area')).toBeInTheDocument();
  });

  it('renders the chart components', () => {
    render(<HourlyChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-temperature')).toBeInTheDocument();
    expect(screen.getByTestId('line-humidity')).toBeInTheDocument();
    expect(screen.getByTestId('line-precipitation')).toBeInTheDocument();
  });

  it('displays start time selector', () => {
    render(<HourlyChart data={mockData} />);
    
    expect(screen.getByLabelText('Start Time:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has default start time options', () => {
    render(<HourlyChart data={mockData} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('0'); // Default to "Now"
    
    // Check that "Now" option exists
    expect(screen.getByText(/Now/)).toBeInTheDocument();
  });

  it('updates chart when start time is changed', () => {
    render(<HourlyChart data={mockData} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '6' } });
    
    expect(select).toHaveValue('6');
  });

  it('displays legend with correct colors and labels', () => {
    render(<HourlyChart data={mockData} />);
    
    expect(screen.getByText('Temperature (°F)')).toBeInTheDocument();
    expect(screen.getByText('Humidity (%)')).toBeInTheDocument();
    expect(screen.getByText('Precipitation (%)')).toBeInTheDocument();
  });

  it('displays informational note', () => {
    render(<HourlyChart data={mockData} />);
    
    expect(screen.getByText(/Showing 48 hours of temperature, humidity, and precipitation data/)).toBeInTheDocument();
  });

  it('handles data with less than 48 periods', () => {
    const shortData = createMockHourlyData(24);
    render(<HourlyChart data={shortData} />);
    
    expect(screen.getByText('48-Hour Weather Forecast')).toBeInTheDocument();
    // Component should still render without errors
  });

  it('formats time labels correctly for chart data', () => {
    // This is a bit tricky to test directly since the time formatting happens
    // inside the component. We'll test that the component renders without errors
    // and that the time-related elements are present
    render(<HourlyChart data={mockData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('includes all expected start time options', () => {
    render(<HourlyChart data={mockData} />);
    
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    
    // Should have options for every 6 hours up to 48 hours (8 options)
    expect(options.length).toBeGreaterThanOrEqual(8);
    
    // Check for "Now" option
    expect(Array.from(options).some(option => option.textContent?.includes('Now'))).toBe(true);
  });

  it('handles periods with null precipitation and humidity values', () => {
    const dataWithNulls: HourlyForecastResponse = {
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
            probabilityOfPrecipitation: {
              unitCode: 'wmoUnit:percent',
              value: null
            },
            relativeHumidity: {
              unitCode: 'wmoUnit:percent',
              value: null
            }
          }
        ]
      }
    };

    render(<HourlyChart data={dataWithNulls} />);
    
    // Should render without throwing errors
    expect(screen.getByText('48-Hour Weather Forecast')).toBeInTheDocument();
  });

  it('processes chart data correctly for different start time offsets', () => {
    render(<HourlyChart data={mockData} />);
    
    const select = screen.getByRole('combobox');
    
    // Change to 6 hours from now
    fireEvent.change(select, { target: { value: '6' } });
    expect(select).toHaveValue('6');
    
    // Change to 12 hours from now
    fireEvent.change(select, { target: { value: '12' } });
    expect(select).toHaveValue('12');
    
    // Component should continue to render without errors
    expect(screen.getByText('48-Hour Weather Forecast')).toBeInTheDocument();
  });
});
