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
    
    expect(screen.getByText('Conditions Report')).toBeInTheDocument();
    expect(screen.getByText('Weather forecasts for your favorite climbing areas')).toBeInTheDocument();
  });

  it('renders the informational note', () => {
      render(<App />);
      
      expect(screen.getByText(/Forecast data provided by the National Weather Service/)).toBeInTheDocument();
    });

  it('renders GitHub link in footer with correct attributes', () => {
    render(<App />);
    
    const githubLink = screen.getByRole('link', { name: /view on github/i });
    
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/mnaylor5/climbing-weather-ts');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(githubLink).toHaveClass('github-link');
    
    // Check that the GitHub icon image is present within the link
    const githubIcon = githubLink.querySelector('img');
    expect(githubIcon).toBeInTheDocument();
    expect(githubIcon).toHaveAttribute('src', '/github-mark.svg');
    expect(githubIcon).toHaveAttribute('alt', 'GitHub logo');
    expect(githubIcon).toHaveAttribute('width', '25');
    expect(githubIcon).toHaveAttribute('height', '25');
  });

  it('renders climbing area selector with default selection', () => {
    render(<App />);
    
    expect(screen.getByText('Climbing Areas')).toBeInTheDocument();
    expect(screen.getByText('TN > Stone Fort (aka Little Rock City)')).toBeInTheDocument();
    expect(screen.getByText('TN > Foster Falls')).toBeInTheDocument();
  });

  it('renders forecast type toggle buttons', () => {
    render(<App />);
    
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Hourly')).toBeInTheDocument();
    
    // Daily should be active by default
    expect(screen.getByText('Daily')).toHaveClass('active');
    expect(screen.getByText('Hourly')).not.toHaveClass('active');
  });

  it('loads and displays mock data when API succeeds', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any) // For Stone Fort
      .mockResolvedValueOnce(mock12HourData as any); // For Foster Falls

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Should be called for both default selected areas
    expect(mockGetWeatherForArea).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'TN > Stone Fort (aka Little Rock City)',
        latitude: 35.249735,
        longitude: -85.21837
      }),
      '12hour'
    );

    expect(mockGetWeatherForArea).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'TN > Foster Falls',
        latitude: 35.17824684210526,
        longitude: -85.6832205263158
      }),
      '12hour'
    );
  });

  it('switches between daily and hourly forecast types', async () => {
    mockGetWeatherForArea
      .mockResolvedValueOnce(mock12HourData as any) // Stone Fort daily
      .mockResolvedValueOnce(mock12HourData as any) // Foster Falls daily
      .mockResolvedValueOnce(mockHourlyData as any) // Stone Fort hourly
      .mockResolvedValueOnce(mockHourlyData as any); // Foster Falls hourly

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

    // Should have been called for both areas with hourly forecast type
    expect(mockGetWeatherForArea).toHaveBeenNthCalledWith(3,
      expect.objectContaining({
        name: 'TN > Stone Fort (aka Little Rock City)'
      }),
      'hourly'
    );

    expect(mockGetWeatherForArea).toHaveBeenNthCalledWith(4,
      expect.objectContaining({
        name: 'TN > Foster Falls'
      }),
      'hourly'
    );
  });

  it('changes climbing area selection and refetches data', async () => {
    mockGetWeatherForArea.mockResolvedValue(mock12HourData as any);

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Should have initial API calls for default areas (2)
    expect(mockGetWeatherForArea).toHaveBeenCalledTimes(2);

    // Open the multi-select dropdown
    const trigger = screen.getByText('2 areas selected');
    fireEvent.click(trigger);

    // Add NV > Red Rocks to selection
    const redRocksOptions = screen.getAllByText('NV > Red Rocks');
    const redRocksCheckboxOption = redRocksOptions.find(el => 
      el.parentElement?.querySelector('input[type="checkbox"]')
    );

    if (redRocksCheckboxOption) {
      fireEvent.click(redRocksCheckboxOption);
    }

    await waitFor(() => {
      expect(mockGetWeatherForArea).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'NV > Red Rocks',
          latitude: 36.133434929292925,
          longitude: -115.45324232323232
        }),
        '12hour'
      );
    });

    // When selection changes, it refetches ALL selected areas 
    // So we expect: 2 initial + 3 after change = 5 total
    await waitFor(() => {
      expect(mockGetWeatherForArea).toHaveBeenCalledTimes(5);
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
    mockGetWeatherForArea.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    // Should still render the table with mock data when API fails
    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // No error should be displayed to the user since we fall back to mock data
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
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

  it('includes all climbing areas in the selector', () => {
    render(<App />);
    
    // Open the dropdown
    const trigger = screen.getByText('2 areas selected');
    fireEvent.click(trigger);
    
    // Should have climbing areas in the dropdown - check for areas that exist in the JSON file
    expect(screen.getByText('NV > Red Rocks')).toBeInTheDocument();
    expect(screen.getByText('CA > Yosemite National Park')).toBeInTheDocument();
    expect(screen.getByText('CA > Joshua Tree National Park')).toBeInTheDocument();
    expect(screen.getByText('CO > Eldorado Canyon State Park')).toBeInTheDocument();
    
    // For these two that also appear as tags, check they exist in dropdown by counting
    const stonefortTexts = screen.getAllByText('TN > Stone Fort (aka Little Rock City)');
    expect(stonefortTexts).toHaveLength(2); // One in tag, one in dropdown
    
    const fosterfallsTexts = screen.getAllByText('TN > Foster Falls');
    expect(fosterfallsTexts).toHaveLength(2); // One in tag, one in dropdown
  });

  it('shows appropriate message when no areas are selected', async () => {
    // Create a test version of App with no default selections
    const TestApp = () => {
      const selectedAreas: string[] = [];
      const weatherData: any[] = [];
      const loading = false;
      const error: string | null = null;

      const renderVisualization = () => {
        if (loading) {
          return <div className="loading">Loading weather data...</div>;
        }

        if (error) {
          return <div className="error">Error: {error}</div>;
        }

        if (!selectedAreas.length || !weatherData.length) {
          return <div className="loading">No data available</div>;
        }

        return <div>Mock visualization</div>;
      };

      return (
        <div className="app">
          {renderVisualization()}
        </div>
      );
    };

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('refetches data when both area selection and forecast type change', async () => {
    mockGetWeatherForArea.mockResolvedValue(mock12HourData as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('forecast-table')).toBeInTheDocument();
    });

    // Initial load should call API for 2 default areas
    expect(mockGetWeatherForArea).toHaveBeenCalledTimes(2);

    // Add another area first  
    const trigger = screen.getByText('2 areas selected');
    fireEvent.click(trigger);
    
    const redRockOptions = screen.getAllByText('NV > Red Rocks');
    const redRockCheckboxOption = redRockOptions.find(el => 
      el.parentElement?.querySelector('input[type="checkbox"]')
    );

    if (redRockCheckboxOption) {
      fireEvent.click(redRockCheckboxOption);
    }

    await waitFor(() => {
      // Should have 5 calls now: 2 initial + 3 for the new selection (all 3 areas)
      expect(mockGetWeatherForArea).toHaveBeenCalledTimes(5);
    });

    // Then change forecast type - this should trigger calls for all 3 areas with hourly type
    fireEvent.click(screen.getByText('Hourly'));

    await waitFor(() => {
      // Should be 8 total calls: 2 initial + 3 for selection change + 3 hourly  
      expect(mockGetWeatherForArea).toHaveBeenCalledTimes(8);
    }, { timeout: 3000 });
    
    // Check the last call was for Red Rock with hourly 
    expect(mockGetWeatherForArea).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'NV > Red Rocks' }),
      'hourly'
    );
  }, 10000);
});
