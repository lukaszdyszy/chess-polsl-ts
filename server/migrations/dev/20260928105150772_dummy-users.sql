-- Up Migration
insert into users (username, email, password_hash) values ('master', 'master@example.com', '$2b$10$rfotNxhipTNtIBrvsi9S4eUdMyet.bVQFapHohy7UQiFnp6DdMrnG');
insert into users (username, email, password_hash) values ('user1', 'user1@example.com', '$2b$10$221z/dZR/IxOZwxZq1X/s.jWACKE4D3QiJdy0JOqTQPAxq3jgtfiq');
insert into users (username, email, password_hash) values ('user2', 'user2@example.com', '$2b$10$BPNw6gIB27q2nylXa7yP1ez5e7hsnP.//th4VvULevvBovjIqvlwW');
insert into users (username, email, password_hash) values ('user3', 'user3@example.com', '$2b$10$bQTIgYhCc8CB83r.Z8wpxu2frBH87ow2j7VSbJmJrabZkS1LwcZiG');
insert into user_statistics (
	user_id,
	elo
) values (
	(select id from users where username = 'master'),
	1500
), (
	(select id from users where username = 'user1'),
	1000
), (
	(select id from users where username = 'user2'),
	1000
), (
	(select id from users where username = 'user3'),
	1000
);

-- Down Migration
delete from user_statistics s where s.user_id in (select id from users where username in ('master', 'user1', 'user2', 'user3'));
delete from users where username in ('master', 'user1', 'user2', 'user3');