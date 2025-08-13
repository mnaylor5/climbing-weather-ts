import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import climbingAreasData from '../data/sample-climbing-areas.json';
import { ClimbingAreaData, ForecastResponse, HourlyForecastResponse } from './weatherData/weatherApi';
import { useWeatherData, ForecastType } from './hooks/useWeatherData';
import MultiSelect from './components/MultiSelect';

// Lazy load the chart components to reduce initial bundle size
const HourlyChart = lazy(() => import('./components/HourlyChart'));
const ForecastTable = lazy(() => import('./components/ForecastTable'));

function App() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['stonefort', 'tensleep']);
  const [forecastType, setForecastType] = useState<ForecastType>('12hour');
  
  const { weatherData, loading, error, fetchWeatherData } = useWeatherData();
  const areas = climbingAreasData as ClimbingAreaData;

  useEffect(() => {
    fetchWeatherData(selectedAreas, forecastType, areas);
  }, [selectedAreas, forecastType, areas, fetchWeatherData]);

  const handleForecastTypeChange = useCallback((type: ForecastType) => {
    setForecastType(type);
  }, []);

  const renderVisualization = useMemo(() => {
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
      return (
        <Suspense fallback={<div className="loading">Loading chart...</div>}>
          <HourlyChart weatherData={weatherData.map(item => ({
            ...item,
            data: item.data as HourlyForecastResponse
          }))} />
        </Suspense>
      );
    } else {
      return (
        <Suspense fallback={<div className="loading">Loading table...</div>}>
          <ForecastTable weatherData={weatherData.map(item => ({
            ...item,
            data: item.data as ForecastResponse
          }))} />
        </Suspense>
      );
    }
  }, [loading, error, weatherData, forecastType]);

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
              onClick={() => handleForecastTypeChange('12hour')}
            >
              Daily
            </button>
            <button
              className={`toggle-button ${forecastType === 'hourly' ? 'active' : ''}`}
              onClick={() => handleForecastTypeChange('hourly')}
            >
              Hourly
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="visualization-container">
          {renderVisualization}
        </div>
      </div>
    </div>
  );
}

export default App;