import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlyForecastResponse } from '../weatherData/weatherApi';

interface HourlyChartProps {
  data: HourlyForecastResponse;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  const [startTimeOffset, setStartTimeOffset] = useState<number>(0);

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

  // Process the data for the chart (take 48 hours starting from selected offset)
  const chartData = data.properties.periods.slice(startTimeOffset, startTimeOffset + 48).map((period) => {
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

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'temperature') {
      return [`${value}°${props.payload.temperatureUnit}`, 'Temperature'];
    }
    if (name === 'humidity') {
      return [`${value}%`, 'Humidity'];
    }
    if (name === 'precipitation') {
      return [`${value}%`, 'Precipitation'];
    }
    return [value, name];
  };

  const formatLabel = (label: string, payload: any[]) => {
    if (payload && payload.length > 0) {
      return payload[0].payload.fullTime;
    }
    return label;
  };

  const startTimeOptions = getStartTimeOptions();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#2d3748', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          48-Hour Weather Forecast
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="start-time-select" style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '500' }}>
            Start Time:
          </label>
          <select
            id="start-time-select"
            value={startTimeOffset}
            onChange={(e) => setStartTimeOffset(Number(e.target.value))}
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
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#4a5568"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              stroke="#4a5568"
              fontSize={12}
              label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
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
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#2196f3" 
              strokeWidth={3}
              dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2196f3', strokeWidth: 2, fill: 'white' }}
            />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: 'white' }}
            />
            <Line 
              type="monotone" 
              dataKey="precipitation" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ 
        marginTop: '10px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
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
      </div>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
        <strong>Note:</strong> Showing 48 hours of temperature, humidity, and precipitation data starting from the selected time. Hover over points for detailed information.
      </div>
    </div>
  );
};

export default HourlyChart;