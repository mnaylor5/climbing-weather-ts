// Mock data for development and demonstration purposes
export const mockHourlyData = {
  properties: {
    periods: Array.from({ length: 48 }, (_, i) => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + i);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      
      // Create realistic temperature curve (cooler at night, warmer during day)
      const hour = startTime.getHours();
      const baseTemp = 65;
      const variation = 15 * Math.sin((hour - 6) * Math.PI / 12);
      const temperature = Math.round(baseTemp + variation);
      
      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        temperature,
        temperatureUnit: 'F',
        windSpeed: `${Math.round(5 + Math.random() * 10)} mph`,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        shortForecast: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
        probabilityOfPrecipitation: {
          unitCode: 'wmoUnit:percent',
          value: Math.random() < 0.3 ? Math.round(Math.random() * 40) : null
        },
        relativeHumidity: {
          unitCode: 'wmoUnit:percent',
          value: Math.round(40 + Math.random() * 40)
        }
      };
    })
  }
};

export const mock12HourData = {
  properties: {
    periods: Array.from({ length: 14 }, (_, i) => {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(i / 2));
      
      const isDaytime = i % 2 === 0;
      const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' });
      
      return {
        number: i + 1,
        name: isDaytime ? dayOfWeek : `${dayOfWeek} Night`,
        startTime: startTime.toISOString(),
        endTime: new Date(startTime.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        isDaytime,
        temperature: isDaytime ? Math.round(70 + Math.random() * 20) : Math.round(45 + Math.random() * 15),
        temperatureUnit: 'F',
        windSpeed: `${Math.round(5 + Math.random() * 15)} mph`,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        icon: 'https://api.weather.gov/icons/land/day/few?size=medium',
        shortForecast: [
          'Sunny', 'Partly Cloudy', 'Mostly Sunny', 'Cloudy', 
          'Partly Sunny', 'Clear', 'Mostly Clear'
        ][Math.floor(Math.random() * 7)],
        detailedForecast: `Temperature around ${isDaytime ? Math.round(70 + Math.random() * 20) : Math.round(45 + Math.random() * 15)}°F.`,
        probabilityOfPrecipitation: {
          unitCode: 'wmoUnit:percent',
          value: Math.random() < 0.4 ? Math.round(Math.random() * 60) : null
        },
        relativeHumidity: {
          unitCode: 'wmoUnit:percent',
          value: Math.round(30 + Math.random() * 50)
        }
      };
    })
  }
};