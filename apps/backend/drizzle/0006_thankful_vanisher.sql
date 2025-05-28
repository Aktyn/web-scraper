CREATE TABLE `scrapers_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`instructions` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scrapers_table_name_unique` ON `scrapers_table` (`name`);--> statement-breakpoint
CREATE TABLE `scraper_data_sources_table` (
	`scraper_id` integer NOT NULL,
	`data_store_table_name` text NOT NULL,
	`source_alias` text NOT NULL,
	`where_schema` text,
	PRIMARY KEY(`scraper_id`, `data_store_table_name`),
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers_table`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`data_store_table_name`) REFERENCES `user_data_stores_table`(`table_name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_source_alias` ON `scraper_data_sources_table` (`scraper_id`,`source_alias`);--> statement-breakpoint
DROP INDEX `unique_name`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_data_stores_table_name_unique` ON `user_data_stores_table` (`name`);