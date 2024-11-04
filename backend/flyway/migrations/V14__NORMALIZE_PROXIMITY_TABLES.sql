SET SEARCH_PATH TO proximity;

CREATE TABLE IF NOT EXISTS t_device
(
    id         SERIAL PRIMARY KEY,
    name       CHAR(17) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE TRIGGER upd_t_device
    BEFORE UPDATE
    ON t_device
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();



ALTER TABLE IF EXISTS t_proximity
    RENAME COLUMN device TO device_id;
ALTER TABLE IF EXISTS t_proximity
    ALTER COLUMN device_id SET DATA TYPE INT USING device_id::integer;

ALTER TABLE IF EXISTS t_proximity
    ADD CONSTRAINT fk_device
        FOREIGN KEY (device_id)
            REFERENCES t_device (id);