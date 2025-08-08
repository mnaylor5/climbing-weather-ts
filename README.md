# Climbing Weather App

A TypeScript React application that fetches and visualizes weather forecasts for climbing areas in the US using the National Weather Service API and Recharts.

![App Screenshot](https://github.com/user-attachments/assets/22efd20b-613f-4ee2-aef8-a8321aaf4e5f)

## Features

- **Responsive design** for mobile and desktop browsers
- **Area selection** - Choose from 6 premier climbing destinations including the newly added Stone Fort in Tennessee
- **Dual forecast modes**:
  - **Hourly forecasts** - Interactive line chart showing 24-hour temperature trends
  - **Daily forecasts** - Comprehensive table showing separate daytime and nighttime periods with temperatures, precipitation, and wind data
- **Real-time data** from the National Weather Service API
- **Fallback mock data** for development and demonstration purposes

![Hourly Chart](https://github.com/user-attachments/assets/5290e5a2-0322-4865-8999-ae385f2cbb52)

## Climbing Areas

The app includes weather data for these climbing destinations:

- **Yosemite National Park** (California) - Trad, Bouldering
- **Red Rock Canyon** (Nevada) - Sport, Trad, Bouldering  
- **Joshua Tree National Park** (California) - Trad, Bouldering
- **Eldorado Canyon** (Colorado) - Trad, Sport
- **The Gunks** (New York) - Trad
- **Stone Fort (Little Rock City)** (Tennessee) - Bouldering

## Technology Stack

- **TypeScript** - Type-safe development
- **React 18** - Modern React with hooks
- **Recharts** - Beautiful, responsive charts
- **Vite** - Fast build tool and development server
- **National Weather Service API** - Reliable government weather data

## Getting Started

### Prerequisites

- Node.js (version 16 or later)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mnaylor5/climbing-weather-ts.git
cd climbing-weather-ts
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The page will reload automatically when you make changes to the source code.

### Testing

Test the weather API functionality:
```bash
npm run test
```

This runs the weather API test script that demonstrates fetching data from different climbing areas.

### Building for Production

Build the app for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment.

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/           # React components
│   ├── HourlyChart.tsx  # Temperature line chart
│   └── ForecastTable.tsx # 7-day forecast table
├── weatherData/         # Weather API logic
│   ├── weatherApi.ts    # National Weather Service API
│   └── mockData.ts      # Development mock data
├── App.tsx             # Main application component
├── main.tsx           # React app entry point
└── index.css          # Global styles
data/
└── sample-climbing-areas.json # Climbing area coordinates
```

## API Integration

The app integrates with the National Weather Service API to fetch real-time weather data. The API provides:

- **Location data** - Grid coordinates for weather stations
- **Hourly forecasts** - Temperature, humidity, precipitation, wind
- **12-hour periods** - Extended forecasts with detailed conditions

When the API is unavailable (e.g., in development), the app gracefully falls back to realistic mock data to demonstrate all features.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data provided by the [National Weather Service](https://www.weather.gov/)
- Charts powered by [Recharts](https://recharts.org/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/) 