-- Up Migration
create table user_statistics (
    user_id bigint not null unique primary key references users(id),
    elo smallint default 1000
);

-- Down Migration
drop table user_statistics;