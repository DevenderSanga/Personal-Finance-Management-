
import { useMemo, useState } from "react";
import {
    FiSearch,
    FiRepeat,
    FiTrendingUp,
    FiTrendingDown,
    FiBriefcase
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount || 0));

function Transactions() {
    const { transactions } = useFinance();

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const title = item.title || "";
            const category = item.category || "";

            const matchesSearch =
                title.toLowerCase().includes(search.toLowerCase()) ||
                category.toLowerCase().includes(search.toLowerCase());

            const matchesType =
                typeFilter === "All" || item.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [transactions, search, typeFilter]);

    const incomeTotal = transactions
        .filter((item) => item.type === "Income")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expenseTotal = transactions
        .filter((item) => item.type === "Expense")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const investmentCount = transactions.filter(
        (item) => item.type === "Investment"
    ).length;

    const investmentBuyTotal = transactions
        .filter(
            (item) =>
                item.type === "Investment" &&
                item.activityType === "Buy"
        )
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const getTransactionIcon = (item) => {
        if (item.type === "Investment") {
            return <FiBriefcase />;
        }

        if (item.type === "Income") {
            return <FiTrendingUp />;
        }

        return <FiTrendingDown />;
    };

    const getAmountClass = (item) => {
        if (item.type === "Income") return "income-text";
        if (item.type === "Expense") return "expense-text";

        return item.flow === "inflow"
            ? "income-text"
            : "expense-text";
    };

    const getAmountSign = (item) => {
        if (item.type === "Income") return "+";
        if (item.type === "Expense") return "-";

        return item.flow === "inflow" ? "+" : "-";
    };

    const getTypeLabel = (item) => {
        if (item.type === "Investment") {
            return `Investment - ${item.activityType || "Activity"}`;
        }

        return item.type;
    };

    return (
        <div className="finance-page">
            <div className="finance-page-heading">
                <div>
                    <h1>Transaction History</h1>
                    <p>
                        View your income, expenses and investment activities
                        in one place.
                    </p>
                </div>
            </div>

            <div className="finance-summary-grid">
                <div className="finance-summary-card">
                    <p>Total Transactions</p>
                    <h2>{transactions.length}</h2>
                    <span>All financial records</span>
                </div>

                <div className="finance-summary-card">
                    <p>Total Income</p>
                    <h2 className="income-text">
                        {currency(incomeTotal)}
                    </h2>
                    <span>Income records</span>
                </div>

                <div className="finance-summary-card">
                    <p>Total Expenses</p>
                    <h2 className="expense-text">
                        {currency(expenseTotal)}
                    </h2>
                    <span>Expense records</span>
                </div>

                <div className="finance-summary-card">
                    <p>Investment Activities</p>
                    <h2>{investmentCount}</h2>
                    <span>
                        Purchases: {currency(investmentBuyTotal)}
                    </span>
                </div>
            </div>

            <section className="finance-table-card">
                <div className="finance-table-heading">
                    <div>
                        <h3>All Transactions</h3>
                        <p>Your complete financial activity.</p>
                    </div>
                </div>

                <div className="finance-filters">
                    <div className="finance-search">
                        <FiSearch />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search transactions..."
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                        <option value="Investment">Investment</option>
                    </select>
                </div>

                <div className="finance-table-scroll">
                    <table className="finance-table">
                        <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((item) => (
                                    <tr key={`${item.type}-${item.id}`}>
                                        <td className="finance-record-title">
                                            <span className="transaction-icon">
                                                {getTransactionIcon(item)}
                                            </span>
                                            {item.title || "Untitled transaction"}
                                        </td>

                                        <td>
                                            <span className="finance-category">
                                                {item.category || "General"}
                                            </span>
                                        </td>

                                        <td>{item.date}</td>

                                        <td>
                                            <span
                                                className={`transaction-status ${
                                                    item.type === "Investment"
                                                        ? "investment"
                                                        : item.type.toLowerCase()
                                                }`}
                                            >
                                                {getTypeLabel(item)}
                                            </span>
                                        </td>

                                        <td className={getAmountClass(item)}>
                                            {getAmountSign(item)}
                                            {currency(item.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="finance-empty">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Transactions;
