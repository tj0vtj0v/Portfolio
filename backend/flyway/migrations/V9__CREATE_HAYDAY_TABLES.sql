SET SEARCH_PATH TO hayday;

CREATE TABLE IF NOT EXISTS t_item
(
    id              SERIAL PRIMARY KEY,
    source_id       INT,
    ingredients_id  INT,
    name            VARCHAR(32) UNIQUE,
    level           INT,
    production_time decimal(6, 2),
    mastered_time   decimal(6, 2),
    experience      INT,
    default_price   INT,
    maximum_price   INT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_ingredient
(
    id              SERIAL PRIMARY KEY,
    ingredient_1_id INT, -- renamed
    quantity_1      DECIMAL(5, 3),
    ingredient_2_id INT, -- renamed
    quantity_2      DECIMAL(5, 3),
    ingredient_3_id INT, -- renamed
    quantity_3      DECIMAL(5, 3),
    ingredient_4_id INT, -- renamed
    quantity_4      DECIMAL(5, 3),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_ingredient_1
        FOREIGN KEY (ingredient_1_id)
            REFERENCES t_item (id),

    CONSTRAINT fk_ingredient_2
        FOREIGN KEY (ingredient_2_id)
            REFERENCES t_item (id),

    CONSTRAINT fk_ingredient_3
        FOREIGN KEY (ingredient_3_id)
            REFERENCES t_item (id),

    CONSTRAINT fk_ingredient_4
        FOREIGN KEY (ingredient_4_id)
            REFERENCES t_item (id)
);

CREATE TABLE IF NOT EXISTS t_source
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(32) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_evaluation
(
    item_id             SERIAL PRIMARY KEY,
    complete_time       DECIMAL(6, 2),
    no_crops_time       DECIMAL(6, 2),
    profit              DECIMAL(5, 2),
    complete_experience INT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_item
        FOREIGN KEY (item_id)
            REFERENCES t_item (id)
);

ALTER TABLE IF EXISTS t_item
    ADD CONSTRAINT fk_source
        FOREIGN KEY (source_id)
            REFERENCES t_source (id);

ALTER TABLE IF EXISTS t_item
    ADD CONSTRAINT fk_ingredients
        FOREIGN KEY (ingredients_id)
            REFERENCES t_ingredient (id);



CREATE TABLE IF NOT EXISTS t_magic_number
(
    level      INT PRIMARY KEY,
    number     INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_animal_steps
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(32) UNIQUE,
    level      INT,
    experience INT,
    cooldown   DECIMAL(5, 2),
    step_value INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE TABLE IF NOT EXISTS t_ore_occurrence
(
    tool       VARCHAR(8) PRIMARY KEY,
    silver     INT,
    gold       INT,
    platinum   INT,
    iron       INT,
    coal       INT,
    diamond    INT,
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
    ON t_item
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_ingredients
    BEFORE UPDATE
    ON t_ingredient
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

CREATE OR REPLACE TRIGGER upd_t_ore_occurrence
    BEFORE UPDATE
    ON t_ore_occurrence
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();