import { useState, useEffect, useCallback } from 'react';
import climbingAreasData from '../data/sample-climbing-areas.json';
import { ClimbingAreaData, getWeatherForArea, ForecastResponse, HourlyForecastResponse } from './weatherData/weatherApi';
import { mockHourlyData, mock12HourData } from './weatherData/mockData';
import HourlyChart from './components/HourlyChart';
import ForecastTable from './components/ForecastTable';
import MultiSelect from './components/MultiSelect';

type ForecastType = 'hourly' | '12hour';

interface AreaWeatherData {
  areaKey: string;
  areaName: string;
  data: ForecastResponse | HourlyForecastResponse;
}

function App() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['stonefort', 'tensleep']);
  const [forecastType, setForecastType] = useState<ForecastType>('12hour');
  const [weatherData, setWeatherData] = useState<AreaWeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areas = climbingAreasData as ClimbingAreaData;

  const fetchWeatherData = useCallback(async () => {
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
  }, [selectedAreas, forecastType, areas]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const renderVisualization = () => {
    if (loading) {
      return <div className="loading">Loading weather data...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (!weatherData.length) {
      return <div className="loading">No data available</div>;
    }

    if (forecastType === 'hourly') {
      return <HourlyChart weatherData={weatherData.map(item => ({
        ...item,
        data: item.data as HourlyForecastResponse
      }))} />;
    } else {
      return <ForecastTable weatherData={weatherData.map(item => ({
        ...item,
        data: item.data as ForecastResponse
      }))} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Climbing Weather</h1>
        <p>Weather forecasts for premier climbing destinations</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="area-select">Climbing Areas</label>
          <div style={{ position: 'relative' }}>
            <MultiSelect
              areas={areas}
              selectedAreas={selectedAreas}
              onChange={setSelectedAreas}
              maxSelections={10}
            />
          </div>
        </div>

        <div className="control-group">
          <label>Forecast Type</label>
          <div className="toggle-buttons">
            <button
              className={`toggle-button ${forecastType === '12hour' ? 'active' : ''}`}
              onClick={() => setForecastType('12hour')}
            >
              Daily
            </button>
            <button
              className={`toggle-button ${forecastType === 'hourly' ? 'active' : ''}`}
              onClick={() => setForecastType('hourly')}
            >
              Hourly
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="visualization-container">
          {renderVisualization()}
        </div>
      </div>
    </div>
  );
}

export default App;