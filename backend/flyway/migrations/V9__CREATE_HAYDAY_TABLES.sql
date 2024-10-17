SET SEARCH_PATH TO hayday;

CREATE TABLE IF NOT EXISTS t_items
(
    id              SERIAL PRIMARY KEY,
    source          INT,
    ingredients     INT,
    name            VARCHAR(32),
    level           INT,
    production_time decimal(6, 2),
    mastered_time   decimal(6, 2),
    experience      INT,
    default_price   INT,
    maximum_price   INT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_ingredients
(
    id           SERIAL PRIMARY KEY,
    ingredient_1 INT,
    quantity_1   DECIMAL(5, 3),
    ingredient_2 INT,
    quantity_2   DECIMAL(5, 3),
    ingredient_3 INT,
    quantity_3   DECIMAL(5, 3),
    ingredient_4 INT,
    quantity_4   DECIMAL(5, 3),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_ingredient_1
        FOREIGN KEY (ingredient_1)
            REFERENCES t_items (id),

    CONSTRAINT fk_ingredient_2
        FOREIGN KEY (ingredient_2)
            REFERENCES t_items (id),

    CONSTRAINT fk_ingredient_3
        FOREIGN KEY (ingredient_3)
            REFERENCES t_items (id),

    CONSTRAINT fk_ingredient_4
        FOREIGN KEY (ingredient_4)
            REFERENCES t_items (id)
);

CREATE TABLE IF NOT EXISTS t_source
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE IF EXISTS t_items
    ADD CONSTRAINT fk_source
        FOREIGN KEY (source)
            REFERENCES t_source (id);

ALTER TABLE IF EXISTS t_items
    ADD CONSTRAINT fk_ingredients
        FOREIGN KEY (ingredients)
            REFERENCES t_ingredients (id);

CREATE TABLE IF NOT EXISTS t_evaluation
(
    id                  SERIAL PRIMARY KEY,
    complete_time       DECIMAL(6, 2),
    no_crops_time       DECIMAL(6, 2),
    profit              DECIMAL(5, 2),
    complete_experience INT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_items
        FOREIGN KEY (id)
            REFERENCES t_items (id)
);

CREATE TABLE IF NOT EXISTS t_magic_number
(
    level        INT PRIMARY KEY,
    magic_number INT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_animal_steps
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(32),
    level      INT,
    experience INT,
    cooldown   DECIMAL(5, 2),
    step_value INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_ore_probability
(
    tool       VARCHAR(8) PRIMARY KEY,
    silver     DECIMAL(4, 2),
    gold       DECIMAL(4, 2),
    platinum   DECIMAL(4, 2),
    iron       DECIMAL(4, 2),
    coal       DECIMAL(4, 2),
    diamond    DECIMAL(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE TRIGGER upd_t_items
    BEFORE UPDATE
    ON t_items
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_ingredients
    BEFORE UPDATE
    ON t_ingredients
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_source
    BEFORE UPDATE
    ON t_source
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_evaluation
    BEFORE UPDATE
    ON t_evaluation
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_magic_number
    BEFORE UPDATE
    ON t_magic_number
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_animal_steps
    BEFORE UPDATE
    ON t_animal_steps
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_ore_probability
    BEFORE UPDATE
    ON t_ore_probability
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();