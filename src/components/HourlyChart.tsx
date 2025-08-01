import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlyForecastResponse } from '../weatherData/weatherApi';

interface HourlyChartProps {
  data: HourlyForecastResponse;
}

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  // Process the data for the chart (take first 24 hours)
  const chartData = data.properties.periods.slice(0, 24).map((period) => {
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
      humidity: period.relativeHumidity?.value || null,
      precipitation: period.probabilityOfPrecipitation?.value || null,
    };
  });

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'temperature') {
      return [`${value}°${props.payload.temperatureUnit}`, 'Temperature'];
    }
    return [value, name];
  };

  const formatLabel = (label: string, payload: any[]) => {
    if (payload && payload.length > 0) {
      return payload[0].payload.fullTime;
    }
    return label;
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.5rem', fontWeight: '600' }}>
        24-Hour Temperature Forecast
      </h2>
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
              label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
        <strong>Note:</strong> Showing the next 24 hours of temperature data. Hover over points for detailed information.
      </div>
    </div>
  );
};

export default HourlyChart;