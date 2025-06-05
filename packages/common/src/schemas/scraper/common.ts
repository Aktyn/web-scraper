export enum ScraperState {
  /** Pending initial execution */
  Pending = "pending",

  /** Between execution iterations or before clean exit */
  Idle = "idle",

  /** Scraper is currently executing given instructions */
  Executing = "executing",

  /** Scraper has been destroyed, either due to an error, user intervention or it finished all its executions */
  Exited = "exited",

  //TODO: awaiting user action, e.g. captcha
}
