ALTER TABLE `users_table` RENAME TO `preferences_table`;--> statement-breakpoint
ALTER TABLE `preferences_table` RENAME COLUMN "id" TO "key";--> statement-breakpoint
ALTER TABLE `preferences_table` RENAME COLUMN "name" TO "value";--> statement-breakpoint
DROP INDEX `users_table_email_unique`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_preferences_table` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_preferences_table`("key", "value") SELECT "key", "value" FROM `preferences_table`;--> statement-breakpoint
DROP TABLE `preferences_table`;--> statement-breakpoint
ALTER TABLE `__new_preferences_table` RENAME TO `preferences_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;