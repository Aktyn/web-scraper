CREATE TABLE `routine_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`result` text,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `scraper_execution_iterations` ADD `success` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `scraper_executions` ADD `routine_id` integer REFERENCES routines(id);--> statement-breakpoint
ALTER TABLE `routines` DROP COLUMN `last_execution_at`;