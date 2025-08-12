import { ForecastResponse } from '../weatherData/weatherApi';

interface ForecastTableProps {
  data: ForecastResponse;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ data }) => {
  const getWeatherEmoji = (forecast: string): string => {
    const condition = forecast.toLowerCase();
    
    // Sunny/Clear conditions
    if (condition.includes('sunny') || condition.includes('clear')) {
      return '☀️';
    }
    
    // Partly cloudy/few clouds
    if (condition.includes('partly') || condition.includes('few')) {
      return '⛅';
    }
    
    // Mostly cloudy/overcast
    if (condition.includes('cloudy') || condition.includes('overcast') || condition.includes('mostly')) {
      return '☁️';
    }
    
    // Rain conditions
    if (condition.includes('rain') || condition.includes('shower')) {
      if (condition.includes('thunderstorm') || condition.includes('storm')) {
        return '⛈️';
      }
      return '🌧️';
    }
    
    // Snow conditions
    if (condition.includes('snow') || condition.includes('flurr')) {
      return '❄️';
    }
    
    // Fog/Mist
    if (condition.includes('fog') || condition.includes('mist')) {
      return '🌫️';
    }
    
    // Wind
    if (condition.includes('wind')) {
      return '💨';
    }
    
    // Default for unknown conditions
    return '🌤️';
  };

  const formatTemperature = (temp: number, unit: string, isHigh: boolean) => {
    return (
      <span className={`temperature ${isHigh ? 'high' : 'low'}`}>
        {temp}°{unit}
      </span>
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
      
      <div className="forecast-tiles-container">
        <div className="forecast-tiles-row">
          {forecastPeriods.map((period, index) => (
            <div key={`${period.startTime}-${index}`} className="forecast-tile">
              <div className="forecast-tile-period">
                {period.displayName}
              </div>
              
              <div className="forecast-tile-icon">
                {getWeatherEmoji(period.shortForecast)}
              </div>
              
              <div className="forecast-tile-temperature">
                {formatTemperature(period.temperature, period.temperatureUnit, period.isDaytime)}
              </div>
              
              <div className="forecast-tile-precipitation">
                {period.precipitation !== null && period.precipitation !== undefined 
                  ? `Precip. chance: ${period.precipitation}%`
                  : 'No precipitation data'
                }
              </div>
              
              <div className="forecast-tile-wind">
                Wind {period.windSpeed} {period.windDirection}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
        <strong>Note:</strong> Forecast data provided by the National Weather Service. Showing separate daytime and nighttime periods for detailed planning.
      </div>
    </div>
  );
};

export default ForecastTable;