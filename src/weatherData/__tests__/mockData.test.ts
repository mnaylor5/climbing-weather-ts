import { mockHourlyData, mock12HourData } from '../mockData';

describe('Mock Data', () => {
  describe('mockHourlyData', () => {
    it('should have the correct structure', () => {
      expect(mockHourlyData).toHaveProperty('properties');
      expect(mockHourlyData.properties).toHaveProperty('periods');
      expect(Array.isArray(mockHourlyData.properties.periods)).toBe(true);
    });

    it('should contain 48 periods (2 days worth of hourly data)', () => {
      expect(mockHourlyData.properties.periods).toHaveLength(48);
    });

    it('should have valid period data structure', () => {
      const firstPeriod = mockHourlyData.properties.periods[0];
      
      expect(firstPeriod).toHaveProperty('startTime');
      expect(firstPeriod).toHaveProperty('endTime');
      expect(firstPeriod).toHaveProperty('temperature');
      expect(firstPeriod).toHaveProperty('temperatureUnit');
      expect(firstPeriod).toHaveProperty('windSpeed');
      expect(firstPeriod).toHaveProperty('windDirection');
      expect(firstPeriod).toHaveProperty('shortForecast');
      expect(firstPeriod).toHaveProperty('probabilityOfPrecipitation');
      expect(firstPeriod).toHaveProperty('relativeHumidity');
    });

    it('should have valid temperature data', () => {
      mockHourlyData.properties.periods.forEach((period) => {
        expect(typeof period.temperature).toBe('number');
        expect(period.temperatureUnit).toBe('F');
        expect(period.temperature).toBeGreaterThan(0);
        expect(period.temperature).toBeLessThan(150); // Reasonable temperature range
      });
    });

    it('should have valid time data', () => {
      mockHourlyData.properties.periods.forEach((period) => {
        expect(new Date(period.startTime)).toBeInstanceOf(Date);
        expect(new Date(period.endTime)).toBeInstanceOf(Date);
        expect(new Date(period.endTime).getTime()).toBeGreaterThan(new Date(period.startTime).getTime());
      });
    });

    it('should have valid wind direction values', () => {
      const validDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      
      mockHourlyData.properties.periods.forEach((period) => {
        expect(validDirections).toContain(period.windDirection);
      });
    });

    it('should have realistic humidity values', () => {
      mockHourlyData.properties.periods.forEach((period) => {
        const humidity = period.relativeHumidity?.value;
        if (humidity !== null && humidity !== undefined) {
          expect(humidity).toBeGreaterThanOrEqual(0);
          expect(humidity).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('mock12HourData', () => {
    it('should have the correct structure', () => {
      expect(mock12HourData).toHaveProperty('properties');
      expect(mock12HourData.properties).toHaveProperty('periods');
      expect(Array.isArray(mock12HourData.properties.periods)).toBe(true);
    });

    it('should contain 14 periods (7 days worth of day/night data)', () => {
      expect(mock12HourData.properties.periods).toHaveLength(14);
    });

    it('should have valid period data structure', () => {
      const firstPeriod = mock12HourData.properties.periods[0];
      
      expect(firstPeriod).toHaveProperty('number');
      expect(firstPeriod).toHaveProperty('name');
      expect(firstPeriod).toHaveProperty('startTime');
      expect(firstPeriod).toHaveProperty('endTime');
      expect(firstPeriod).toHaveProperty('isDaytime');
      expect(firstPeriod).toHaveProperty('temperature');
      expect(firstPeriod).toHaveProperty('temperatureUnit');
      expect(firstPeriod).toHaveProperty('windSpeed');
      expect(firstPeriod).toHaveProperty('windDirection');
      expect(firstPeriod).toHaveProperty('icon');
      expect(firstPeriod).toHaveProperty('shortForecast');
      expect(firstPeriod).toHaveProperty('detailedForecast');
    });

    it('should alternate between daytime and nighttime periods', () => {
      mock12HourData.properties.periods.forEach((period, index) => {
        if (index % 2 === 0) {
          expect(period.isDaytime).toBe(true);
        } else {
          expect(period.isDaytime).toBe(false);
        }
      });
    });

    it('should have realistic temperature differences between day and night', () => {
      for (let i = 0; i < mock12HourData.properties.periods.length - 1; i += 2) {
        const dayPeriod = mock12HourData.properties.periods[i];
        const nightPeriod = mock12HourData.properties.periods[i + 1];
        
        if (dayPeriod.isDaytime && !nightPeriod.isDaytime) {
          expect(dayPeriod.temperature).toBeGreaterThan(nightPeriod.temperature);
        }
      }
    });

    it('should have valid temperature ranges for day and night', () => {
      mock12HourData.properties.periods.forEach((period) => {
        if (period.isDaytime) {
          expect(period.temperature).toBeGreaterThanOrEqual(70);
          expect(period.temperature).toBeLessThanOrEqual(90);
        } else {
          expect(period.temperature).toBeGreaterThanOrEqual(45);
          expect(period.temperature).toBeLessThanOrEqual(60);
        }
      });
    });

    it('should have sequential period numbers', () => {
      mock12HourData.properties.periods.forEach((period, index) => {
        expect(period.number).toBe(index + 1);
      });
    });

    it('should have valid icon URLs', () => {
      mock12HourData.properties.periods.forEach((period) => {
        expect(period.icon).toMatch(/^https:\/\/api\.weather\.gov\/icons/);
      });
    });
  });
});
