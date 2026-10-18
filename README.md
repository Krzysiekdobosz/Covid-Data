# CovidData

Dashboard with COVID-19 vaccination and hospitalisation statistics for over 200 countries, based on data published by Our World in Data (December 2020 – May 2024).

**Live demo:** https://krzysiekdobosz.github.io/Covid-Data/

## Features

- Global overview: doses administered, coverage, progress chart, continents and country rankings
- Country list with search and sortable columns
- Country page with vaccination coverage, daily doses and hospital / ICU occupancy charts
- Comparison of up to six countries for a chosen metric (state kept in the URL)
- User accounts (JWT) with a personal watchlist of countries

## Tech stack

- **Server:** Node.js, Express, Sequelize (SQLite by default, MySQL via `DATABASE_URL`), JSON Web Tokens, express-validator
- **Client:** React 18, React Router, Chart.js, Vite

## Project structure

```
server/
├── data/                 source CSV files
├── scripts/import.js     imports the CSV files into the database
├── scripts/export-static.js  exports API responses as JSON for the demo
└── src/                  Express app, models, services and routes
client/
├── public/data/          static data used by the demo build
└── src/                  React application
```

## Running locally

```bash
# server
cd server
cp .env.example .env
npm install
npm run import      # ~420k rows, takes about a minute
npm run dev         # http://localhost:5000

# client (second terminal)
cd client
npm install
npm run dev         # http://localhost:5173, /api is proxied to the server
```

## API

| Method | Endpoint                                   | Description                                  |
| ------ | ------------------------------------------ | -------------------------------------------- |
| GET    | `/api/summary`                             | World figures, regions and rankings          |
| GET    | `/api/countries?type=country\|region`      | Locations with their latest values           |
| GET    | `/api/countries/:iso`                      | Single location                              |
| GET    | `/api/countries/:iso/vaccinations`         | Time series (`interval=week\|day`, `from`, `to`) |
| GET    | `/api/countries/:iso/hospitalizations`     | Hospital and ICU time series                 |
| POST   | `/api/auth/register`, `/api/auth/login`    | Accounts                                     |
| GET    | `/api/watchlist`                           | Watched countries (requires a token)         |
| POST   | `/api/watchlist`                           | Add a country (`isoCode`)                    |
| DELETE | `/api/watchlist/:iso`                      | Remove a country                             |

## Demo build

The GitHub Pages version has no server: statistics are read from JSON files produced by `npm run export-static`, and accounts and watchlists are stored in the browser (demo login: `demo` / `demo123`).

```bash
cd client
npm run build:demo    # build only
npm run deploy:demo   # build and publish to the gh-pages branch
```

## Tests

```bash
cd server && npm test
cd client && npm test
```
