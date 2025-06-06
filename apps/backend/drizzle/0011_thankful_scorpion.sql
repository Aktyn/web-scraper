CREATE TABLE `scraper_execution_infos` (
	`execution_id` text NOT NULL,
	`iteration` integer NOT NULL,
	`scraper_id` integer NOT NULL,
	`execution_info` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`execution_id`, `iteration`),
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade
);
