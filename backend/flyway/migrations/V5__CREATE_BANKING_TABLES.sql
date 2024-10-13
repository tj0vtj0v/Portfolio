SET SEARCH_PATH TO banking;

CREATE TABLE t_history
(
    account    VARCHAR(22), -- added
    date       DATE,
    amount     DECIMAL(9, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    PRIMARY KEY (account, date)
);

CREATE TABLE t_transaction
(
    id               SERIAL PRIMARY KEY,
    account          VARCHAR(22), -- added
    amount           DECIMAL(9, 2),
    currencycode     CHAR(3),     -- added
    date             DATE,
    bdate            DATE,
    vdate            DATE,
    peer             VARCHAR(256),
    postingtext      VARCHAR(64),
    reasonforpayment VARCHAR(512),
    customerreferenz VARCHAR(64), -- deprecated
    mandatereference VARCHAR(32), -- deprecated
    peeraccount      VARCHAR(32),
    peerbic          VARCHAR(16),
    peerid           VARCHAR(64),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);



CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Berlin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER upd_t_history
    BEFORE UPDATE
    ON t_history
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER upd_t_transaction
    BEFORE UPDATE
    ON t_transaction
    FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();