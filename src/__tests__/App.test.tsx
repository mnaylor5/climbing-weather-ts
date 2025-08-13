import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import * as weatherApi from '../weatherData/weatherApi';
import { mockHourlyData, mock12HourData } from '../weatherData/mockData';

// Mock the weather API functions
jest.mock('../weatherData/weatherApi', () => ({
  ...jest.requireActual('../weatherData/weatherApi'),
  getWeatherForArea: jest.fn(),
}));

// Mock the chart components to avoid SVG rendering issues
jest.mock('../components/HourlyChart', () => {
  return function MockHourlyChart({ weatherData }: any) {
    return (
      <div data-testid="hourly-chart">
        Hourly Chart with {weatherData.length} areas
        {weatherData.map((area: any, index: number) => (
          <div key={index}>Area: {area.areaName}</div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/ForecastTable', () => {
  return function MockForecastTable({ weatherData }: any) {
    return (
      <div data-testid="forecast-table">
        Forecast Table with {weatherData.length} areas
        {weatherData.map((area: any, index: number) => (
          <div key={index}>Area: {area.areaName}</div>
        ))}
      </div>
    );
  };
});

const mockGetWeatherForArea = weatherApi.getWeatherForArea as jest.MockedFunction<typeof weatherApi.getWeatherForArea>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app header correctly', () => {
    render(<App />);
    
    expect(screen.getByText('Climbing Weather')).toBeInTheDocument();
    expect(screen.getByText('Weather forecasts for premier climbing destinations')).toBeInTheDocument();
  });

  it('renders climbing area selector with default selection', () => {
    render(<App />);
    
    expect(screen.getByText('Climbing Areas')).toBeInTheDocument();
    expect(screen.getByText('Stone Fort (Little Rock City)')).toBeInTheDocument();
    expect(screen.getByText('Ten Sleep Canyon')).toBeInTheDocument();
  });

  it('renders forecast type toggle buttons', () => {
    render(<App />);
    
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Hourly')).toBeInTheDocument();
    
    // Daily should be active by default
    expect(screen.getByText('Daily')).toHaveClass('active');
    expect(screen.getByText('Hourly')).not.toHaveClass('active');
  });

  it.skip('loads and displays mock data when API succeeds', async () => {
    mockGetWeatherForArea.mockResolvedValueOnce(mock12HourData as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    expect(mockGetWeatherForArea).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Red Rock Canyon',
        latitude: 36.1315,
        longitude: -115.4266
      }),
      '12hour'
    );
  });

  it.skip('switches between daily and hourly forecast types', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any)
      .mockResolvedValueOnce(mockHourlyData as any);

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Switch to hourly
    fireEvent.click(screen.getByText('Hourly'));

    await waitFor(() => {
      expect(screen.getByTestId('hourly-chart')).toBeInTheDocument();
    });

    expect(mockGetWeatherForArea).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        name: 'Red Rock Canyon'
      }),
      'hourly'
    );
  });

  it.skip('changes climbing area and refetches data', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any)
      .mockResolvedValueOnce(mock12HourData as any);

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Change area
    const select = screen.getByDisplayValue('Red Rock Canyon');
    fireEvent.change(select, { target: { value: 'yosemite' } });

    await waitFor(() => {
      expect(mockGetWeatherForArea).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          name: 'Yosemite National Park',
          latitude: 37.8651,
          longitude: -119.5383
        }),
        '12hour'
      );
    });
  });

  it('shows loading state while fetching data', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetWeatherForArea.mockReturnValueOnce(promise as any);

    render(<App />);

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!(mock12HourData);

    await waitFor(() => {
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully and shows mock data', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockGetWeatherForArea.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'API failed for Stone Fort (Little Rock City), using mock data:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('updates forecast type toggle button states correctly', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any)
      .mockResolvedValueOnce(mockHourlyData as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Initially Daily should be active
    expect(screen.getByText('Daily')).toHaveClass('active');
    expect(screen.getByText('Hourly')).not.toHaveClass('active');

    // Click Hourly
    fireEvent.click(screen.getByText('Hourly'));

    await waitFor(() => {
      expect(screen.getByText('Hourly')).toHaveClass('active');
      expect(screen.getByText('Daily')).not.toHaveClass('active');
    });
  });

  it.skip('includes all climbing areas in the selector', () => {
    render(<App />);
    
    // Open the dropdown
    const trigger = screen.getByText('2 areas selected');
    trigger.click();
    
    // Should have all climbing areas in the dropdown
    expect(screen.getByText('Red Rock Canyon')).toBeInTheDocument();
    expect(screen.getByText('Yosemite National Park')).toBeInTheDocument();
    expect(screen.getByText('Joshua Tree National Park')).toBeInTheDocument();
    expect(screen.getByText('Eldorado Canyon')).toBeInTheDocument();
    expect(screen.getByText('The Gunks')).toBeInTheDocument();
    expect(screen.getByText('Stone Fort (Little Rock City)')).toBeInTheDocument();
    expect(screen.getByText('Ten Sleep Canyon')).toBeInTheDocument();
  });

  it.skip('shows appropriate message when no data is available', async () => {
    mockGetWeatherForArea.mockResolvedValueOnce(null as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it.skip('refetches data when both area and forecast type change', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any)
      .mockResolvedValueOnce(mock12HourData as any)
      .mockResolvedValueOnce(mockHourlyData as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Change area first
    const select = screen.getByDisplayValue('Red Rock Canyon');
    fireEvent.change(select, { target: { value: 'yosemite' } });

    await waitFor(() => {
      expect(mockGetWeatherForArea).toHaveBeenCalledTimes(2);
    });

    // Then change forecast type
    fireEvent.click(screen.getByText('Hourly'));

    await waitFor(() => {
      expect(mockGetWeatherForArea).toHaveBeenCalledTimes(3);
      expect(mockGetWeatherForArea).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'Yosemite National Park' }),
        'hourly'
      );
    });
  });
});
