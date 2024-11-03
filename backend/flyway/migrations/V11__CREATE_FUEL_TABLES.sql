SET SEARCH_PATH TO fuel;

CREATE TABLE IF NOT EXISTS t_fuel_type
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(6) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_refuel
(
    id           SERIAL PRIMARY KEY,
    date         DATE,
    distance     DECIMAL(6, 1),
    consumption  DECIMAL(6, 2),
    cost         DECIMAL(6, 2),
    fuel_type_id INT, -- changed
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_fuel_type
        FOREIGN KEY (fuel_type_id)
            REFERENCES t_fuel_type (id)
);



CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE TRIGGER upd_t_fuel_type
    BEFORE UPDATE
    ON t_fuel_type
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_refuel
    BEFORE UPDATE
    ON t_refuel
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();