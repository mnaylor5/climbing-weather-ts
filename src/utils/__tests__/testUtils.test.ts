import {
  createMockClimbingArea,
  createMockForecastPeriod,
  createMockHourlyPeriod,
  createMockApiResponse,
  createMockLocationResponse,
  addHours,
  addDays,
  isValidTemperature,
  isValidHumidity,
  isValidPrecipitation,
  isValidWindDirection,
  isValidDate,
  generateMockForecastPeriods,
  generateMockHourlyPeriods,
} from '../testUtils';

describe('Test Utilities', () => {
  describe('Mock Creators', () => {
    it('creates mock climbing area with defaults', () => {
      const area = createMockClimbingArea();
      
      expect(area.name).toBe('Test Climbing Area');
      expect(area.latitude).toBe(40.0);
      expect(area.longitude).toBe(-105.0);
      expect(area.climbingType).toEqual(['sport', 'trad']);
    });

    it('creates mock climbing area with overrides', () => {
      const area = createMockClimbingArea({
        name: 'Custom Area',
        latitude: 50.0,
        climbingType: ['bouldering']
      });
      
      expect(area.name).toBe('Custom Area');
      expect(area.latitude).toBe(50.0);
      expect(area.longitude).toBe(-105.0); // Default value preserved
      expect(area.climbingType).toEqual(['bouldering']);
    });

    it('creates mock forecast period with defaults', () => {
      const period = createMockForecastPeriod();
      
      expect(period.number).toBe(1);
      expect(period.name).toBe('Today');
      expect(period.isDaytime).toBe(true);
      expect(period.temperature).toBe(75);
      expect(period.temperatureUnit).toBe('F');
      expect(period.shortForecast).toBe('Sunny');
    });

    it('creates mock hourly period with defaults', () => {
      const period = createMockHourlyPeriod();
      
      expect(period.temperature).toBe(75);
      expect(period.temperatureUnit).toBe('F');
      expect(period.windSpeed).toBe('10 mph');
      expect(period.windDirection).toBe('SW');
      expect(period.shortForecast).toBe('Sunny');
    });

    it('creates mock API response', () => {
      const periods = [createMockForecastPeriod(), createMockForecastPeriod()];
      const response = createMockApiResponse(periods);
      
      expect(response.properties.periods).toHaveLength(2);
      expect(response.properties.periods).toEqual(periods);
    });

    it('creates mock location response', () => {
      const response = createMockLocationResponse();
      
      expect(response.properties.forecast).toContain('api.weather.gov');
      expect(response.properties.forecastHourly).toContain('api.weather.gov');
      expect(response.properties.forecastGridData).toContain('api.weather.gov');
    });
  });

  describe('Date Utilities', () => {
    const baseDate = new Date('2025-08-09T12:00:00Z');

    it('adds hours correctly', () => {
      const result = addHours(baseDate, 3);
      expect(result.getUTCHours()).toBe(15);
      expect(result.getUTCDate()).toBe(baseDate.getUTCDate());
    });

    it('adds hours across day boundary', () => {
      const result = addHours(baseDate, 15);
      expect(result.getUTCDate()).toBe(baseDate.getUTCDate() + 1);
    });

    it('adds days correctly', () => {
      const result = addDays(baseDate, 5);
      expect(result.getUTCDate()).toBe(baseDate.getUTCDate() + 5);
      expect(result.getUTCHours()).toBe(baseDate.getUTCHours());
    });

    it('handles negative values', () => {
      const resultHours = addHours(baseDate, -6);
      const resultDays = addDays(baseDate, -2);
      
      expect(resultHours.getUTCHours()).toBe(6);
      expect(resultDays.getUTCDate()).toBe(baseDate.getUTCDate() - 2);
    });
  });

  describe('Validation Utilities', () => {
    describe('isValidTemperature', () => {
      it('validates normal temperatures', () => {
        expect(isValidTemperature(32)).toBe(true);
        expect(isValidTemperature(100)).toBe(true);
        expect(isValidTemperature(-10)).toBe(true);
      });

      it('rejects extreme temperatures', () => {
        expect(isValidTemperature(-100)).toBe(false);
        expect(isValidTemperature(200)).toBe(false);
      });

      it('handles boundary values', () => {
        expect(isValidTemperature(-50)).toBe(true);
        expect(isValidTemperature(150)).toBe(true);
        expect(isValidTemperature(-51)).toBe(false);
        expect(isValidTemperature(151)).toBe(false);
      });
    });

    describe('isValidHumidity', () => {
      it('validates normal humidity values', () => {
        expect(isValidHumidity(0)).toBe(true);
        expect(isValidHumidity(50)).toBe(true);
        expect(isValidHumidity(100)).toBe(true);
      });

      it('accepts null values', () => {
        expect(isValidHumidity(null)).toBe(true);
      });

      it('rejects invalid humidity values', () => {
        expect(isValidHumidity(-1)).toBe(false);
        expect(isValidHumidity(101)).toBe(false);
      });
    });

    describe('isValidPrecipitation', () => {
      it('validates normal precipitation values', () => {
        expect(isValidPrecipitation(0)).toBe(true);
        expect(isValidPrecipitation(50)).toBe(true);
        expect(isValidPrecipitation(100)).toBe(true);
      });

      it('accepts null values', () => {
        expect(isValidPrecipitation(null)).toBe(true);
      });

      it('rejects invalid precipitation values', () => {
        expect(isValidPrecipitation(-1)).toBe(false);
        expect(isValidPrecipitation(101)).toBe(false);
      });
    });

    describe('isValidWindDirection', () => {
      it('validates cardinal directions', () => {
        expect(isValidWindDirection('N')).toBe(true);
        expect(isValidWindDirection('S')).toBe(true);
        expect(isValidWindDirection('E')).toBe(true);
        expect(isValidWindDirection('W')).toBe(true);
      });

      it('validates intercardinal directions', () => {
        expect(isValidWindDirection('NE')).toBe(true);
        expect(isValidWindDirection('SE')).toBe(true);
        expect(isValidWindDirection('SW')).toBe(true);
        expect(isValidWindDirection('NW')).toBe(true);
      });

      it('rejects invalid directions', () => {
        expect(isValidWindDirection('X')).toBe(false);
        expect(isValidWindDirection('North')).toBe(false);
        expect(isValidWindDirection('n')).toBe(false);
        expect(isValidWindDirection('')).toBe(false);
      });
    });

    describe('isValidDate', () => {
      it('validates ISO date strings', () => {
        expect(isValidDate('2025-08-09T12:00:00Z')).toBe(true);
        expect(isValidDate('2025-08-09T12:00:00-07:00')).toBe(true);
      });

      it('validates simple date formats', () => {
        expect(isValidDate('2025-08-09')).toBe(true);
        expect(isValidDate('August 9, 2025')).toBe(true);
      });

      it('rejects invalid date strings', () => {
        expect(isValidDate('not a date')).toBe(false);
        expect(isValidDate('2025-13-32')).toBe(false);
        expect(isValidDate('')).toBe(false);
      });
    });
  });

  describe('Mock Data Generators', () => {
    describe('generateMockForecastPeriods', () => {
      it('generates the correct number of periods', () => {
        const periods = generateMockForecastPeriods(6);
        expect(periods).toHaveLength(6);
      });

      it('alternates between day and night', () => {
        const periods = generateMockForecastPeriods(4);
        
        expect(periods[0].isDaytime).toBe(true);
        expect(periods[1].isDaytime).toBe(false);
        expect(periods[2].isDaytime).toBe(true);
        expect(periods[3].isDaytime).toBe(false);
      });

      it('generates sequential period numbers', () => {
        const periods = generateMockForecastPeriods(3);
        
        expect(periods[0].number).toBe(1);
        expect(periods[1].number).toBe(2);
        expect(periods[2].number).toBe(3);
      });

      it('generates valid dates', () => {
        const periods = generateMockForecastPeriods(2);
        
        periods.forEach(period => {
          expect(isValidDate(period.startTime)).toBe(true);
          expect(isValidDate(period.endTime)).toBe(true);
          expect(new Date(period.endTime).getTime()).toBeGreaterThan(new Date(period.startTime).getTime());
        });
      });

      it('generates reasonable temperatures', () => {
        const periods = generateMockForecastPeriods(10);
        
        periods.forEach(period => {
          expect(isValidTemperature(period.temperature)).toBe(true);
          
          // Day temperatures should generally be higher than night temperatures
          if (period.isDaytime) {
            expect(period.temperature).toBeGreaterThan(60);
          } else {
            expect(period.temperature).toBeLessThan(80);
          }
        });
      });
    });

    describe('generateMockHourlyPeriods', () => {
      it('generates the correct number of periods', () => {
        const periods = generateMockHourlyPeriods(24);
        expect(periods).toHaveLength(24);
      });

      it('generates sequential hourly periods', () => {
        const baseDate = new Date('2025-08-09T12:00:00Z');
        const periods = generateMockHourlyPeriods(3, baseDate);
        
        const firstStart = new Date(periods[0].startTime);
        const secondStart = new Date(periods[1].startTime);
        const thirdStart = new Date(periods[2].startTime);
        
        expect(secondStart.getTime() - firstStart.getTime()).toBe(60 * 60 * 1000); // 1 hour
        expect(thirdStart.getTime() - secondStart.getTime()).toBe(60 * 60 * 1000); // 1 hour
      });

      it('generates varying temperatures', () => {
        const periods = generateMockHourlyPeriods(24);
        const temperatures = periods.map(p => p.temperature);
        
        // Should have some variation (not all the same)
        const uniqueTemps = new Set(temperatures);
        expect(uniqueTemps.size).toBeGreaterThan(10);
        
        // All should be valid
        temperatures.forEach(temp => {
          expect(isValidTemperature(temp)).toBe(true);
        });
      });

      it('generates valid date ranges', () => {
        const periods = generateMockHourlyPeriods(5);
        
        periods.forEach(period => {
          expect(isValidDate(period.startTime)).toBe(true);
          expect(isValidDate(period.endTime)).toBe(true);
          
          const startTime = new Date(period.startTime);
          const endTime = new Date(period.endTime);
          const diffHours = (endTime.getTime() - startTime.getTime()) / (60 * 60 * 1000);
          
          expect(diffHours).toBe(1); // Each period should be exactly 1 hour
        });
      });
    });
  });
});
