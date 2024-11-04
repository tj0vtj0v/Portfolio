from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


class Account(Base):
    __tablename__ = 't_account'
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    name: Mapped[str_22]

    histories: Mapped[Optional[List["History"]]] = relationship("History", back_populates="account")
    transactions: Mapped[Optional[List["Transaction"]]] = relationship("Transaction", back_populates="account")


class History(Base):
    __tablename__ = "t_history"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account_id: Mapped[int] = mapped_column(ForeignKey('banking.t_account.id'))
    date: Mapped[date]
    amount: Mapped[float]

    account: Mapped[Optional["Account"]] = relationship("Account", back_populates="histories")


class Transaction(Base):
    __tablename__ = "t_transaction"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account_id: Mapped[int] = mapped_column(ForeignKey('banking.t_account.id'))
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

    account: Mapped[Optional["Account"]] = relationship("Account", back_populates="transactions")
