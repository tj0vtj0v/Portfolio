SET SEARCH_PATH TO accounting;

CREATE TABLE IF NOT EXISTS t_account -- added
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(16) UNIQUE,
    balance    DECIMAL(9, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_category -- added
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(16) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_expense
(
    id          SERIAL PRIMARY KEY, -- added
    reason      VARCHAR(32),
    amount      DECIMAL(9, 2),
    date        DATE,
    account_id  INT,                -- renamed
    category_id INT,                -- renamed
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_account
        FOREIGN KEY (account_id)
            REFERENCES t_account (id),

    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
            REFERENCES t_category (id)
);

CREATE TABLE IF NOT EXISTS t_transfer -- added
(
    id         SERIAL PRIMARY KEY,
    source_id  INT,
    target_id  INT,
    amount     DECIMAL(9, 2),
    date       DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_source
        FOREIGN KEY (source_id)
            REFERENCES t_account (id),

    CONSTRAINT fk_target
        FOREIGN KEY (target_id)
            REFERENCES t_account (id)
);

CREATE TABLE IF NOT EXISTS t_monthly_cost -- added
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(16) UNIQUE,
    amount     DECIMAL(9, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_yearly_cost -- added
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(16) UNIQUE,
    amount     DECIMAL(9, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS t_monthly_closing
(
    date         DATE PRIMARY KEY,
    balance      DECIMAL(9, 2),
    depreciation DECIMAL(9, 2),
    bonus        DECIMAL(9, 2),
    fun_money    DECIMAL(9, 2),
    save_money   DECIMAL(9, 2),
    remaining    DECIMAL(9, 2),
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



CREATE OR REPLACE TRIGGER upd_t_account
    BEFORE UPDATE
    ON t_account
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_category
    BEFORE UPDATE
    ON t_category
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_expense
    BEFORE UPDATE
    ON t_expense
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_transfer
    BEFORE UPDATE
    ON t_transfer
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_monthly_cost
    BEFORE UPDATE
    ON t_monthly_cost
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_yearly_cost
    BEFORE UPDATE
    ON t_yearly_cost
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE OR REPLACE TRIGGER upd_t_monthly_closing
    BEFORE UPDATE
    ON t_monthly_closing
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();