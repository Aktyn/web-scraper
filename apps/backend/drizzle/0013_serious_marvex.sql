PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scraper_execution_infos` (
	`execution_id` text NOT NULL,
	`iteration` integer NOT NULL,
	`scraper_id` integer NOT NULL,
	`execution_info` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	PRIMARY KEY(`execution_id`, `iteration`),
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scraper_execution_infos`("execution_id", "iteration", "scraper_id", "execution_info", "created_at") SELECT "execution_id", "iteration", "scraper_id", "execution_info", "created_at" FROM `scraper_execution_infos`;--> statement-breakpoint
DROP TABLE `scraper_execution_infos`;--> statement-breakpoint
ALTER TABLE `__new_scraper_execution_infos` RENAME TO `scraper_execution_infos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;