export const TERMS = {
  scraper: {
    name: "Scraper",
    description:
      "In the context of this project, a scraper is a set of instructions that allows interaction with a web browser and a local database through user-defined data stores.\n\nThanks to the ability to define conditions and marker-based loops, scraper instructions can be made into complex algorithms.\nThese conditions can compare page content, allowing the scraper to decide its course of action based on the state of a web page.\n\nA scraper can open multiple tabs or pages, enabling more complex tasks, such as logging into an account with two-factor authentication enabled.",
  },
  dataStore: {
    name: "Data Store",
    description:
      'A Data Store is a table created by the user.\nIt allows users to save new data scraped from a website and to iterate over an existing set of data.\n\nAll data, including data stores, scrapers, routines, etc., is stored in a local SQLite database ("data.db" file).\nThe database file should be created automatically in the root directory.\nIt can be accessed with any SQLite browser.',
  },
  dataSource: {
    name: "Data source",
    description:
      "The data source is part of the scraper configuration. It is an aliased and optionally filtered data store.\nFiltering the data store allows the user to execute the scraper on a subset of a larger data set.",
  },
  iterator: {
    name: "Iterator",
    description:
      "The user can configure the iterator for a single scraper execution or a routine setup, which defines how the scraper will execute according to its data source.\nFor example, a scraper can repeat its execution for each row in the selected data source, or it can run only for rows that meet certain conditions.\nRunning a scraper without an iterator can be used to insert new rows into the data store.",
  },
  routine: {
    name: "Routine",
    description:
      "Routines allow for the cyclic execution of scrapers.\nFor example, a user can create a routine that runs a scraper every day at a specific time.",
  },
}
