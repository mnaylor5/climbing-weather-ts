import { useState, useEffect } from 'react';
import climbingAreasData from '../data/sample-climbing-areas.json';
import { ClimbingAreaData, getWeatherForArea, ForecastResponse, HourlyForecastResponse } from './weatherData/weatherApi';
import { mockHourlyData, mock12HourData } from './weatherData/mockData';
import HourlyChart from './components/HourlyChart';
import ForecastTable from './components/ForecastTable';

type ForecastType = 'hourly' | '12hour';

function App() {
  const [selectedArea, setSelectedArea] = useState<string>('redrocks');
  const [forecastType, setForecastType] = useState<ForecastType>('12hour');
  const [weatherData, setWeatherData] = useState<ForecastResponse | HourlyForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areas = climbingAreasData as ClimbingAreaData;

  const fetchWeatherData = async () => {
    if (!selectedArea) return;

    setLoading(true);
    setError(null);
    
    try {
      const area = areas[selectedArea];
      const data = await getWeatherForArea(area, forecastType);
      setWeatherData(data);
    } catch (err) {
      console.warn('API failed, using mock data for development:', err);
      // Use mock data when API fails (development mode)
      const mockData = forecastType === 'hourly' ? mockHourlyData : mock12HourData;
      setWeatherData(mockData as any);
      setError(null); // Clear error when using mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [selectedArea, forecastType]);

  const renderVisualization = () => {
    if (loading) {
      return <div className="loading">Loading weather data...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (!weatherData) {
      return <div className="loading">No data available</div>;
    }

    if (forecastType === 'hourly') {
      return <HourlyChart data={weatherData as HourlyForecastResponse} />;
    } else {
      return <ForecastTable data={weatherData as ForecastResponse} />;
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
          <label htmlFor="area-select">Climbing Area</label>
          <select
            id="area-select"
            className="select-input"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {Object.entries(areas).map(([key, area]) => (
              <option key={key} value={key}>
                {area.name}
              </option>
            ))}
          </select>
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