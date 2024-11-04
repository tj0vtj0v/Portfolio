from backend.core.database.models.__init__ import *


class History(Base):
    __tablename__ = "t_history"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account: Mapped[str_22]  # TODO refactor in own table
    date: Mapped[date]
    amount: Mapped[float]


class Transaction(Base):
    __tablename__ = "t_transaction"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account: Mapped[str_22]  # TODO refactor in own table
    amount: Mapped[float]
    currencycode: Mapped[str_3]
    date: Mapped[date]
    bdate: Mapped[date]
    vdate: Mapped[date]
    peer: Mapped[str_256]
    postingtext: Mapped[str_64]
    reasonforpayment: Mapped[str_512]
    customerreferenz: Mapped[str_64]
    mandatereference: Mapped[str_32]
    peeraccount: Mapped[str_32]
    peerbic: Mapped[str_16]
    peerid: Mapped[str_64]
