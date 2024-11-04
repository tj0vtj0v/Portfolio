SET SEARCH_PATH TO banking;

CREATE TABLE IF NOT EXISTS t_account
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(22),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE TRIGGER upd_t_account
    BEFORE UPDATE
    ON t_account
    FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();



ALTER TABLE IF EXISTS t_history
    RENAME COLUMN account TO account_id;
ALTER TABLE IF EXISTS t_history
    ALTER COLUMN account_id SET DATA TYPE INT USING account_id::integer;

ALTER TABLE IF EXISTS t_history
    ADD CONSTRAINT fk_account
        FOREIGN KEY (account_id)
            REFERENCES t_account (id);



ALTER TABLE IF EXISTS t_transaction
    RENAME COLUMN account TO account_id;
ALTER TABLE IF EXISTS t_transaction
    ALTER COLUMN account_id SET DATA TYPE INT USING account_id::integer;

ALTER TABLE IF EXISTS t_transaction
    ADD CONSTRAINT fk_account
        FOREIGN KEY (account_id)
            REFERENCES t_account (id);