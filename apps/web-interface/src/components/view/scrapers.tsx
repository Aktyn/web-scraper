export function Scrapers() {
  //TODO: scraper creation form (scraperInstructionsSchema) with selection of user data stores (preferably automatic selection based on the scraper instructions)
  //TODO: allow choosing custom userData directory for scraper
  //TODO: manage running state scraper instances on the server
  // Scraper will be stored in the database. It can be run by api endpoint, also paused etc. Use SSE to get realtime scraper state.

  return (
    <div data-transition-direction="left" className="view-transition">
      <h1>Scrapers</h1>
    </div>
  )
}
