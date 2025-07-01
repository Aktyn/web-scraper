PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scraper_id` integer NOT NULL,
	`iterator` text,
	`status` text DEFAULT 'active' NOT NULL,
	`description` text,
	`scheduler` text NOT NULL,
	`pause_after_number_of_failed_executions` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	FOREIGN KEY (`scraper_id`) REFERENCES `scrapers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_routines`("id", "scraper_id", "iterator", "status", "description", "scheduler", "pause_after_number_of_failed_executions", "created_at", "updated_at") SELECT "id", "scraper_id", "iterator", "status", "description", "scheduler", "pause_after_number_of_failed_executions", "created_at", "updated_at" FROM `routines`;--> statement-breakpoint
DROP TABLE `routines`;--> statement-breakpoint
ALTER TABLE `__new_routines` RENAME TO `routines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;