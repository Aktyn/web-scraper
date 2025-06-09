CREATE TABLE `scraper_execution_iterations` (
	`iteration` integer NOT NULL,
	`execution_id` integer NOT NULL,
	`execution_info` text NOT NULL,
	`finished_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	PRIMARY KEY(`iteration`, `execution_id`),
	FOREIGN KEY (`execution_id`) REFERENCES `scraper_executions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scraper_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scraper_id` integer NOT NULL,
	`iterator` text,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `scraper_execution_infos`;