drop table users;
drop table usertype;
drop table userloginhistory;
drop table verifications;

truncate users;
truncate userloginhistory;
truncate verifications;

CREATE TABLE IF NOT EXISTS `usertype`
(
    `id`       TINYINT      NOT NULL AUTO_INCREMENT,
    `type`     VARCHAR(50)  NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id`),
    INDEX (`type`),
    CONSTRAINT UC_EMAIL UNIQUE (`type`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8;

INSERT INTO `usertype` (`id`, `type`) VALUES (1, 'aha');
INSERT INTO `usertype` (`id`, `type`) VALUES (2, 'google');
INSERT INTO `usertype` (`id`, `type`) VALUES (3, 'facebook');

-- create users table
CREATE TABLE IF NOT EXISTS `users`
(
    `id`       INT(11)      NOT NULL AUTO_INCREMENT,
    `name`     VARCHAR(50)  NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email`    VARCHAR(255) NOT NULL,
    `user_type`  TINYINT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX (`email`),
    INDEX (`user_type`),
    CONSTRAINT UC_USERS_EMAIL UNIQUE (`email`, `user_type`),
    FOREIGN KEY(user_type) REFERENCES usertype(id)
) ENGINE = InnoDB
  AUTO_INCREMENT = 2
  DEFAULT CHARSET = utf8;

-- create userloginhistory
CREATE TABLE IF NOT EXISTS `userloginhistory`
(
    `id`         INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`    VARCHAR(255) NOT NULL,
    `last_login`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 2
  DEFAULT CHARSET = utf8;


-- create verifications
CREATE TABLE IF NOT EXISTS `verifications`
(
    `id`         int(11)      NOT NULL AUTO_INCREMENT,
    `email`      varchar(250) NOT NULL,
    `token`      varchar(250)          DEFAULT NULL,
    `verify`     TINYINT               DEFAULT 0,
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;
