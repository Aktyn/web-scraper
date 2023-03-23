# Web Scraper

### A highly configurable web scraping tool

---

## Setup

```bash
# Install and build the project
yarn install
yarn run env
yarn run build
yarn run db:generate:reset
yarn run db:seed # optionally
```

## Running the project

```bash
yarn run start
# or
yarn run dev
```

## Database management

```bash
# Reset the database to state with generated empty tables
yarn run db:generate:reset

# Open the database studio in the browser
yarn run db:studio

# Seed the database with test data
yarn run db:seed
```

## Running tests

```bash
yarn run test
```
