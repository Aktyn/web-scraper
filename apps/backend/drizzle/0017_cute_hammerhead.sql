CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') || substr(strftime('%f', 'now'), 4) as integer)) NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`data` text NOT NULL
);
