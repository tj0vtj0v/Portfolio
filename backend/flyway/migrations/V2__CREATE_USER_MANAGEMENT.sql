SET SEARCH_PATH TO authentication;

CREATE TABLE t_role
(
    id         SERIAL PRIMARY KEY,
    priority   INT,
    name       VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE t_user
(
    id         SERIAL PRIMARY KEY,
    password   CHAR(64),
    first_name VARCHAR(64),
    last_name  VARCHAR(64),
    email      VARCHAR(64) UNIQUE,
    username   VARCHAR(16) UNIQUE,
    role_id    INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER upd_t_user
    BEFORE UPDATE
    ON t_user
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER upd_t_role
    BEFORE UPDATE
    ON t_role
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
