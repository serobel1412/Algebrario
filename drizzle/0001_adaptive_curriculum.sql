CREATE TABLE IF NOT EXISTS `topics` (
  `id` varchar(80) NOT NULL,
  `number` int NOT NULL,
  `title` varchar(180) NOT NULL,
  `level` enum('Inicio','Intermedio','Reto') NOT NULL,
  `description` text NOT NULL,
  `content` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
  CONSTRAINT `topics_id` PRIMARY KEY(`id`),
  CONSTRAINT `topics_number_idx` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` varchar(100) NOT NULL,
  `topicId` varchar(80) NOT NULL,
  `difficulty` enum('Básico','Intermedio','Reto') NOT NULL,
  `prompt` text NOT NULL,
  `type` enum('choice','text') NOT NULL,
  `options` json,
  `answer` text NOT NULL,
  `socratic_hints` json NOT NULL,
  `explanation` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `exercises_id` PRIMARY KEY(`id`),
  KEY `exercises_topic_idx` (`topicId`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_progress` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `topicId` varchar(80) NOT NULL,
  `mastery` int NOT NULL DEFAULT 0,
  `streak` int NOT NULL DEFAULT 0,
  `difficulty` enum('Básico','Intermedio','Reto') NOT NULL DEFAULT 'Básico',
  `attempts` int NOT NULL DEFAULT 0,
  `correct` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
  CONSTRAINT `user_progress_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_progress_user_topic_idx` UNIQUE(`userId`,`topicId`),
  KEY `user_progress_user_idx` (`userId`)
);
