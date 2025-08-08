import { ForecastResponse } from '../weatherData/weatherApi';

interface ForecastTableProps {
  data: ForecastResponse;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ data }) => {
  const formatTemperature = (temp: number, unit: string, isHigh: boolean) => {
    return (
      <span className={`temperature ${isHigh ? 'high' : 'low'}`}>
        {temp}°{unit}
      </span>
    );
  };

  const formatPrecipitation = (prob: number | null) => {
    if (prob === null || prob === undefined) return 'N/A';
    return (
      <div className="precipitation">
        <span>{prob}%</span>
        <div className="precipitation-bar">
          <div 
            className="precipitation-fill" 
            style={{ width: `${prob}%` }}
          />
        </div>
      </div>
    );
  };

  const renderForecastPeriods = () => {
    const periods = data.properties.periods.slice(0, 14); // Show next 7 days (14 periods)
    
    return periods.map((period) => {
      const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
          return period.isDaytime ? 'Today' : 'Tonight';
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return period.isDaytime ? 'Tomorrow' : 'Tomorrow Night';
        } else {
          return period.name;
        }
      };

      return {
        ...period,
        displayName: formatTime(period.startTime),
        precipitation: period.probabilityOfPrecipitation?.value || null,
      };
    });
  };

  const forecastPeriods = renderForecastPeriods();

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.5rem', fontWeight: '600' }}>
        Daily Forecast
      </h2>
      
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Temperature</th>
            <th>Conditions</th>
            <th>Precipitation</th>
            <th>Wind</th>
          </tr>
        </thead>
        <tbody>
          {forecastPeriods.map((period, index) => (
            <tr key={`${period.startTime}-${index}`}>
              <td>
                <div className="day-name">
                  {period.displayName}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {formatTemperature(period.temperature, period.temperatureUnit, period.isDaytime)}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>
                  {period.shortForecast}
                </div>
              </td>
              <td>
                {formatPrecipitation(period.precipitation)}
              </td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>
                  {period.windSpeed} {period.windDirection}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
        <strong>Note:</strong> Forecast data provided by the National Weather Service. Showing separate daytime and nighttime periods for detailed planning.
      </div>
    </div>
  );
};

export default ForecastTable;