SET SEARCH_PATH TO authentication;

CREATE TABLE IF NOT EXISTS t_role -- added
(
    id         SERIAL PRIMARY KEY,
    priority   INT UNIQUE,
    name       VARCHAR(16) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_user -- added
(
    id         SERIAL PRIMARY KEY,
    password   CHAR(64),
    first_name VARCHAR(64),
    last_name  VARCHAR(64),
    email      VARCHAR(64) UNIQUE,
    username   VARCHAR(16) UNIQUE,
    role_id    INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_role
        FOREIGN KEY (role_id)
            REFERENCES t_role (id)
);



CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE TRIGGER upd_t_user
    BEFORE UPDATE
    ON t_user
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_role
    BEFORE UPDATE
    ON t_role
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();
