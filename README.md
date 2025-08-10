# 🧗 Climbing Weather App

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A modern TypeScript React application that provides real-time weather forecasts for popular climbing areas across the United States. Built with the National Weather Service API and featuring interactive visualizations powered by Recharts.

## ✨ Features

- 📱 **Responsive Design** - Optimized for both mobile and desktop browsers
- 📊 **Dual Forecast Modes**:
  - **Hourly Forecasts** - Interactive line charts showing 24-hour temperature trends
  - **Daily Forecasts** - Comprehensive tables with daytime/nighttime periods, temperatures, precipitation, and wind data
- 🌦️ **Real-time Weather Data** - Live updates from the National Weather Service API

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mnaylor5/climbing-weather-ts.git
   cd climbing-weather-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Builds the app for production to `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:api` | Run API integration tests |

## 🧪 Testing

### Test Suite (94 tests total)
- **API Integration**: Weather service calls, error scenarios, data parsing
- **Component Testing**: UI behavior, user interactions, loading states
- **Data Validation**: Mock data generation, edge cases, null handling
- **Integration Testing**: Component communication and state management

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

The test suite ensures reliability and provides confidence for refactoring and new feature development.

## 🏗️ Project Structure

```
climbing-weather-ts/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── HourlyChart.tsx        # Interactive temperature line chart
│   │   └── ForecastTable.tsx      # 7-day forecast data table
│   ├── 📁 weatherData/
│   │   ├── weatherApi.ts          # National Weather Service API integration
│   │   └── mockData.ts            # Development mock data
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # React application entry point
│   └── index.css                  # Global styles and CSS variables
├── 📁 data/
│   └── sample-climbing-areas.json # Popular climbing area coordinates
├── 📁 test/
│   └── testWeatherApi.ts         # API integration tests
├── package.json                   # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # Project documentation
```

## 🌤️ API Integration

This application integrates with the **National Weather Service API** to provide accurate, real-time weather forecasts:

### Data Sources
- **Location Services** - Converts coordinates to weather grid points
- **Hourly Forecasts** - Temperature, humidity, precipitation probability, wind speed/direction
- **Extended Forecasts** - 12-hour periods with detailed conditions and descriptions

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/) with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized builds
- **Charts & Visualization**: [Recharts](https://recharts.org/) for interactive weather charts
- **Styling**: CSS3 with CSS Variables for theming
- **API**: [National Weather Service API](https://www.weather.gov/documentation/services-web-api) for real-time weather data
- **Testing**: [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) with 92%+ coverage

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add tests for new API integrations
- Update documentation for new features

## 📝 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Weather Data**: [National Weather Service](https://www.weather.gov/) for providing free, reliable weather APIs
- **Charts**: [Recharts](https://recharts.org/) for beautiful and responsive data visualizations  
- **Build Tools**: [Vite](https://vitejs.dev/) and [React](https://reactjs.org/) for modern development experience
- **Community**: The climbing community for inspiring weather-aware outdoor adventures
