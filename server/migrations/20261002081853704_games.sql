-- Up Migration
create type game_winner as enum ('WHITE', 'BLACK', 'DRAW');
create type game_end_reason as enum (
	'CHECKMATE',
	'RESIGN',
	'TIMEOUT',
	'AGREEMENT',
	'STALEMATE',
	'INSUFFICIENT_MATERIAL',
	'THREEFOLD_REPETITION',
	'FIFTY_MOVE_RULE',
	'DISCONNECT'
);

create table games (
    id bigserial primary key,
    time_start timestamp not null,
	time_end timestamp not null,
	timeformat varchar(10) not null,
    is_ranked boolean not null,
	disconnection_timeout integer not null,
    white_user_id bigint not null references users(id),
    black_user_id bigint not null references users(id),
    white_rating_before smallint not null,
    black_rating_before smallint not null,
    white_rating_after smallint not null,
    black_rating_after smallint not null,
    winner game_winner not null,
    reason game_end_reason not null,
	record text not null
);

-- Down Migration
drop table games;
drop type game_winner;
drop type game_end_reason;