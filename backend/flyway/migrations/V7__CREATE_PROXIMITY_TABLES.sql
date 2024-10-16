SET SEARCH_PATH TO proximity;

CREATE TABLE IF NOT EXISTS t_proximity
(
    id           SERIAL PRIMARY KEY,
    device       CHAR(17),
    timestamp    TIMESTAMP,
    responsetime DECIMAL(6, 2),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE TRIGGER upd_t_proximity
    BEFORE UPDATE
    ON t_proximity
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();