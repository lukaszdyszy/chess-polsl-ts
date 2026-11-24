-- Up Migration
create table refresh_tokens (
    id bigserial primary key,
    token varchar(255) not null,
    user_id bigint not null references users(id)
);

-- Down Migration
drop table refresh_tokens;