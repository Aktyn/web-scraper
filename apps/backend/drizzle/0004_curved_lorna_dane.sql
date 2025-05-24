PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_data_stores_table` (
	`table_name` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_user_data_stores_table`("table_name", "name", "description") SELECT "table_name", "name", "description" FROM `user_data_stores_table`;--> statement-breakpoint
DROP TABLE `user_data_stores_table`;--> statement-breakpoint
ALTER TABLE `__new_user_data_stores_table` RENAME TO `user_data_stores_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_name` ON `user_data_stores_table` (`name`);