# Web Scraper

### A highly configurable web scraping tool

---

## Setup

```bash
# Install and build the project
npm install
npm run env
npm run build
npm run db:generate:reset
npm run db:seed # optionally
```

## Running the project

```bash
npm run start
# or
npm run dev
```

## Database management

```bash
# Reset the database to state with generated empty tables
npm run db:generate:reset 

# Open the database studio in the browser
npm run db:studio

# Seed the database with test data
npm run db:seed
```

## Running tests

```bash
npm run test
```