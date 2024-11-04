from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


class Account(Base):
    __tablename__ = "t_account"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    name: Mapped[str_16]
    balance: Mapped[float]

    expenses: Mapped[Optional[List["Expense"]]] = relationship("Expense", back_populates="account")
    outgoing_transfers: Mapped[Optional[List["Transfer"]]] = relationship("Transfer",
                                                                          foreign_keys="[Transfer.source_id]",
                                                                          back_populates="source")
    incoming_transfers: Mapped[Optional[List["Transfer"]]] = relationship("Transfer",
                                                                          foreign_keys="[Transfer.target_id]",
                                                                          back_populates="target")


class Category(Base):
    __tablename__ = "t_category"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    name: Mapped[str_16]

    expenses: Mapped[Optional[List["Expense"]]] = relationship("Expense", back_populates="category")


class Expense(Base):
    __tablename__ = "t_expense"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    reason: Mapped[str_32]
    amount: Mapped[float]
    date: Mapped[date]
    account_id: Mapped[int] = mapped_column(ForeignKey("accounting.t_account.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("accounting.t_category.id"))

    account: Mapped[Optional["Account"]] = relationship("Account", back_populates="expenses")
    category: Mapped[Optional["Category"]] = relationship(Category, back_populates="expenses")


class Transfer(Base):
    __tablename__ = "t_transfer"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    source_id: Mapped[int] = mapped_column(ForeignKey("accounting.t_account.id"))
    target_id: Mapped[int] = mapped_column(ForeignKey("accounting.t_account.id"))
    amount: Mapped[float]
    date: Mapped[date]

    source: Mapped[Optional["Account"]] = relationship("Account", foreign_keys=[source_id],
                                                       back_populates="outgoing_transfers")
    target: Mapped[Optional["Account"]] = relationship("Account", foreign_keys=[target_id],
                                                       back_populates="incoming_transfers")


class MonthlyCost(Base):
    __tablename__ = "t_monthly_cost"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    name: Mapped[str_16]
    amount: Mapped[float]


class YearlyCost(Base):
    __tablename__ = "t_yearly_cost"
    __table_args__ = {'schema': 'accounting'}

    id: Mapped[serial_pk]
    name: Mapped[str_16]
    amount: Mapped[float]


class MonthlyClosing(Base):
    __tablename__ = "t_monthly_closing"
    __table_args__ = {'schema': 'accounting'}

    date: Mapped[date] = mapped_column(Date, primary_key=True, nullable=False)
    balance: Mapped[float]
    depreciation: Mapped[float]
    bonus: Mapped[float]
    fun_money: Mapped[float]
    save_money: Mapped[float]
    remaining: Mapped[float]
