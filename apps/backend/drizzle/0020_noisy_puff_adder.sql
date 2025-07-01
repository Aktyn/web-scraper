CREATE TABLE `routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scraper_id` integer NOT NULL,
	`iterator` text,
	`status` text NOT NULL,
	`description` text,
	`scheduler` text NOT NULL,
	`pause_after_number_of_failed_executions` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade
);
