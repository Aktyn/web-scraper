PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scraper_data_sources` (
	`scraper_id` integer NOT NULL,
	`data_store_table_name` text NOT NULL,
	`source_alias` text NOT NULL,
	`where_schema` text,
	PRIMARY KEY(`scraper_id`, `data_store_table_name`),
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`data_store_table_name`) REFERENCES `user_data_stores`(`table_name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_scraper_data_sources`("scraper_id", "data_store_table_name", "source_alias", "where_schema") SELECT "scraper_id", "data_store_table_name", "source_alias", "where_schema" FROM `scraper_data_sources`;--> statement-breakpoint
DROP TABLE `scraper_data_sources`;--> statement-breakpoint
ALTER TABLE `__new_scraper_data_sources` RENAME TO `scraper_data_sources`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_source_alias` ON `scraper_data_sources` (`scraper_id`,`source_alias`);