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

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupPeriodsByDay = () => {
    const periods = data.properties.periods.slice(0, 14); // Show next 7 days (14 periods)
    const grouped: { [key: string]: any[] } = {};
    
    periods.forEach(period => {
      const date = new Date(period.startTime);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(period);
    });
    
    return Object.entries(grouped).map(([dateKey, periodGroup]) => {
      const dayPeriods = periodGroup;
      const dayPeriod = dayPeriods.find(p => p.isDaytime) || dayPeriods[0];
      const nightPeriod = dayPeriods.find(p => !p.isDaytime);
      
      return {
        date: dateKey,
        displayDate: formatTime(dayPeriod.startTime),
        highTemp: dayPeriod ? dayPeriod.temperature : null,
        lowTemp: nightPeriod ? nightPeriod.temperature : null,
        unit: dayPeriod.temperatureUnit,
        humidity: dayPeriod.relativeHumidity?.value || null,
        precipitation: dayPeriod.probabilityOfPrecipitation?.value || null,
        forecast: dayPeriod.shortForecast,
        windSpeed: dayPeriod.windSpeed,
        windDirection: dayPeriod.windDirection,
      };
    }).slice(0, 7); // Limit to 7 days
  };

  const dailyForecasts = groupPeriodsByDay();

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.5rem', fontWeight: '600' }}>
        7-Day Forecast
      </h2>
      
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>High / Low</th>
            <th>Conditions</th>
            <th>Humidity</th>
            <th>Precipitation</th>
            <th>Wind</th>
          </tr>
        </thead>
        <tbody>
          {dailyForecasts.map((day, index) => (
            <tr key={day.date}>
              <td>
                <div className="day-name">
                  {index === 0 ? 'Today' : day.displayDate}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {day.highTemp && formatTemperature(day.highTemp, day.unit, true)}
                  {day.highTemp && day.lowTemp && <span style={{ color: '#a0aec0' }}>/</span>}
                  {day.lowTemp && formatTemperature(day.lowTemp, day.unit, false)}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>
                  {day.forecast}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>
                  {day.humidity ? `${day.humidity}%` : 'N/A'}
                </div>
              </td>
              <td>
                {formatPrecipitation(day.precipitation)}
              </td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>
                  {day.windSpeed} {day.windDirection}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
        <strong>Note:</strong> Forecast data provided by the National Weather Service. High/low temperatures and conditions are representative of daytime and nighttime periods.
      </div>
    </div>
  );
};

export default ForecastTable;