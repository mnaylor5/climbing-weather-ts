import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HourlyForecastResponse } from '../weatherData/weatherApi';

interface HourlyChartProps {
  weatherData: Array<{
    areaKey: string;
    areaName: string;
    data: HourlyForecastResponse;
  }>;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ weatherData }) => {
  const [startTimeOffset, setStartTimeOffset] = useState<number>(0);

  // Custom hook to get window width
  const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState<number>(
      typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
  };

  const windowWidth = useWindowWidth();

  // Calculate responsive interval based on screen width
  const getResponsiveInterval = () => {
    if (windowWidth < 480) {
      return 17; // Very small screens (phones in portrait) - show fewer labels
    } else if (windowWidth < 768) {
      return 11; // Small screens (phones in landscape, small tablets)
    } else if (windowWidth < 1024) {
      return 7; // Medium screens (tablets)
    } else if (windowWidth < 1440) {
      return 5; // Desktop screens
    } else {
      return 2; // Large desktop screens - show more labels
    }
  };

  // Get start time options (every 6 hours for the next 24 hours)  
  const getStartTimeOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 48; i += 6) {
      const optionTime = new Date(now);
      optionTime.setHours(optionTime.getHours() + i);
      
      let label;
      if (i === 0) {
        label = 'Now';
      } else if (i < 24) {
        label = `${i} hours from now`;
      } else {
        const days = Math.floor(i / 24);
        const hours = i % 24;
        if (hours === 0) {
          label = `${days} day${days > 1 ? 's' : ''} from now`;
        } else {
          label = `${days} day${days > 1 ? 's' : ''}, ${hours} hours from now`;
        }
      }
      
      options.push({
        value: i,
        label,
        time: optionTime.toLocaleString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          hour12: true 
        })
      });
    }
    return options;
  };

  // Process the data for each area's chart (take 48 hours starting from selected offset)
  const processChartData = (data: HourlyForecastResponse) => {
    return data.properties.periods.slice(startTimeOffset, startTimeOffset + 48).map((period) => {
      const date = new Date(period.startTime);
      return {
        time: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          hour: 'numeric',
          hour12: true 
        }),
        fullTime: date.toLocaleString(),
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        shortForecast: period.shortForecast,
        windSpeed: period.windSpeed,
        humidity: period.relativeHumidity?.value ?? null,
        precipitation: period.probabilityOfPrecipitation?.value ?? null,
      };
    });
  };

  const formatTooltip = (value: unknown, name: string, props: any) => {
    const numValue = value as number | null;
    if (name === 'temperature') {
      return [`${numValue}°${props.payload.temperatureUnit}`, 'Temperature'];
    }
    if (name === 'humidity') {
      return [`${numValue}%`, 'Humidity'];
    }
    if (name === 'precipitation') {
      return [`${numValue}%`, 'Precipitation'];
    }
    return [numValue, name];
  };

  const formatLabel = (label: string, payload?: any[]) => {
    if (payload && payload.length > 0) {
      return payload[0].payload.fullTime;
    }
    return label;
  };

  const startTimeOptions = getStartTimeOptions();

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartTimeOffset(Number(e.target.value));
  };

  const renderChart = (areaData: { areaKey: string; areaName: string; data: HourlyForecastResponse }, index: number) => {
    const chartData = processChartData(areaData.data);
    
    return (
      <div key={areaData.areaKey} style={{ marginBottom: index < weatherData.length - 1 ? '40px' : '0' }}>
        <h2 style={{ color: '#2d3748', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
          {areaData.areaName}: Hourly Forecast
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#4a5568"
                fontSize={12}
                angle={0}
                height={80}
                interval={getResponsiveInterval()}
              />
              <YAxis 
                stroke="#4a5568"
                fontSize={12}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={formatLabel}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend/>
              <Line 
                type="monotone" 
                dataKey="temperature" 
                name="Temperature"
                stroke="#2196f3" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: '#2196f3', strokeWidth: 2, fill: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                name="Humidity (%)"
                stroke="#22c55e" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="precipitation" 
                name="Precipitation (%)"
                stroke="#f59e0b" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* <div style={{ 
          marginTop: '0px', 
          marginBottom: '10px',
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          fontSize: '0.9rem', 
          color: '#4a5568' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '16px', 
              height: '3px', 
              backgroundColor: '#2196f3', 
              borderRadius: '2px' 
            }}></div>
            Temperature (°F)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '16px', 
              height: '3px', 
              backgroundColor: '#22c55e', 
              borderRadius: '2px' 
            }}></div>
            Humidity (%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '16px', 
              height: '3px', 
              backgroundColor: '#f59e0b', 
              borderRadius: '2px' 
            }}></div>
            Precipitation (%)
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="start-time-select" style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
            Start Time:
          </label>
          <select
            id="start-time-select"
            value={startTimeOffset}
            onChange={handleStartTimeChange}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '0.9rem',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            {startTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.time})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {weatherData.map((areaData, index) => renderChart(areaData, index))}
    </div>
  );
};

export default HourlyChart;