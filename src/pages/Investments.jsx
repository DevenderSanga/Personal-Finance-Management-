import { useMemo, useState } from "react";
import {
    FiPlus,
    FiTrendingUp,
    FiTrendingDown,
    FiBriefcase,
    FiDollarSign,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiPieChart
} from "react-icons/fi";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import { useFinance } from "../context/FinanceContext";

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

const investmentTypes = [
    "Stocks",
    "Mutual Funds",
    "Fixed Deposit",
    "Gold",
    "Bonds",
    "Other"
];

const emptyForm = {
    name: "",
    type: "Stocks",
    symbol: "",
    units: "",
    avgBuyPrice: "",
    currentPrice: "",
    date: new Date().toISOString().slice(0, 10)
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

export default function Investments() {
    const {
        investments,
        addRecord,
        updateRecord,
        deleteRecord
    } = useFinance();

    const [showModal, setShowModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [error, setError] = useState("");

    const portfolio = useMemo(() => {
        const invested = investments.reduce(
            (sum, item) =>
                sum + Number(item.units) * Number(item.avgBuyPrice),
            0
        );

        const current = investments.reduce(
            (sum, item) =>
                sum + Number(item.units) * Number(item.currentPrice),
            0
        );

        const profit = current - invested;
        const returns = invested > 0 ? (profit / invested) * 100 : 0;

        return { invested, current, profit, returns };
    }, [investments]);

    const distribution = useMemo(() => {
        const totals = {};

        investments.forEach((item) => {
            const value =
                Number(item.units) * Number(item.currentPrice);

            totals[item.type] = (totals[item.type] || 0) + value;
        });

        return Object.entries(totals).map(([name, value]) => ({
            name,
            value
        }));
    }, [investments]);

    const filteredInvestments = useMemo(() => {
        return investments.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                (item.symbol || "").toLowerCase().includes(search.toLowerCase());

            const matchesType =
                filterType === "All" || item.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [investments, search, filterType]);

    const openAddModal = () => {
        setEditingInvestment(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);
    };

    const openEditModal = (investment) => {
        setEditingInvestment(investment);
        setForm({
            name: investment.name,
            type: investment.type,
            symbol: investment.symbol || "",
            units: investment.units,
            avgBuyPrice: investment.avgBuyPrice,
            currentPrice: investment.currentPrice,
            date: investment.date
        });
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingInvestment(null);
        setForm(emptyForm);
        setError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const units = Number(form.units);
        const avgBuyPrice = Number(form.avgBuyPrice);
        const currentPrice = Number(form.currentPrice);

        if (
            !form.name.trim() ||
            !form.date ||
            !Number.isFinite(units) ||
            !Number.isFinite(avgBuyPrice) ||
            !Number.isFinite(currentPrice) ||
            units <= 0 ||
            avgBuyPrice <= 0 ||
            currentPrice <= 0
        ) {
            setError("Please enter valid details in all required fields.");
            return;
        }

        const record = {
            ...form,
            name: form.name.trim(),
            symbol: form.symbol.trim().toUpperCase(),
            units,
            avgBuyPrice,
            currentPrice
        };

        if (editingInvestment) {
            updateRecord("investments", {
                ...record,
                id: editingInvestment.id
            });
        } else {
            addRecord("investments", record);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this investment?"
        );

        if (confirmed) {
            deleteRecord("investments", id);
        }
    };

    const getInvestmentValue = (item) =>
        Number(item.units) * Number(item.currentPrice);

    const getInvestmentCost = (item) =>
        Number(item.units) * Number(item.avgBuyPrice);

    const getInvestmentProfit = (item) =>
        getInvestmentValue(item) - getInvestmentCost(item);

    const getInvestmentReturn = (item) => {
        const cost = getInvestmentCost(item);

        return cost > 0
            ? (getInvestmentProfit(item) / cost) * 100
            : 0;
    };

    const chartColors = [
        "#6366f1",
        "#14b8a6",
        "#f59e0b",
        "#ec4899",
        "#8b5cf6",
        "#64748b"
    ];

    return (
        <div className="investments-page">
            <div className="investments-heading">
                <div>
                    <span className="investments-eyebrow">
                        WEALTH MANAGEMENT
                    </span>
                    <h1>My Investments</h1>
                    <p>
                        Track your portfolio, monitor returns and manage
                        your investments.
                    </p>
                </div>

                <button
                    className="investments-add-button"
                    onClick={openAddModal}
                >
                    <FiPlus />
                    Add Investment
                </button>
            </div>

            {/* Portfolio summary */}
            <div className="investments-summary-grid">
                <div className="investments-summary-card">
                    <div className="investments-summary-top">
                        <span>Total Invested</span>
                        <span className="investments-icon purple">
                            <FiBriefcase />
                        </span>
                    </div>
                    <h2>{currency(portfolio.invested)}</h2>
                    <p>Amount invested in your portfolio</p>
                </div>

                <div className="investments-summary-card">
                    <div className="investments-summary-top">
                        <span>Current Value</span>
                        <span className="investments-icon blue">
                            <FiDollarSign />
                        </span>
                    </div>
                    <h2>{currency(portfolio.current)}</h2>
                    <p>Current estimated portfolio value</p>
                </div>

                <div className="investments-summary-card">
                    <div className="investments-summary-top">
                        <span>Total Profit / Loss</span>
                        <span className={`investments-icon ${
                            portfolio.profit >= 0 ? "green" : "red"
                        }`}>
                            {portfolio.profit >= 0
                                ? <FiTrendingUp />
                                : <FiTrendingDown />}
                        </span>
                    </div>
                    <h2 className={portfolio.profit >= 0 ? "positive" : "negative"}>
                        {currency(portfolio.profit)}
                    </h2>
                    <p>Overall portfolio gain or loss</p>
                </div>

                <div className="investments-summary-card">
                    <div className="investments-summary-top">
                        <span>Overall Returns</span>
                        <span className="investments-icon orange">
                            <FiPieChart />
                        </span>
                    </div>
                    <h2 className={portfolio.returns >= 0 ? "positive" : "negative"}>
                        {portfolio.returns.toFixed(2)}%
                    </h2>
                    <p>Return on total invested amount</p>
                </div>
            </div>

            {/* Portfolio distribution */}
            <div className="investments-overview-grid">
                <section className="investments-panel">
                    <div className="investments-panel-heading">
                        <div>
                            <h3>Portfolio Distribution</h3>
                            <p>Current value by investment type</p>
                        </div>
                    </div>

                    {distribution.length > 0 ? (
                        <div className="investments-chart-layout">
                            <div className="investments-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={chartColors[index % chartColors.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => currency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="investments-legend">
                                {distribution.map((item, index) => (
                                    <div
                                        className="investments-legend-item"
                                        key={item.name}
                                    >
                                        <div>
                                            <span
                                                className="investments-legend-dot"
                                                style={{
                                                    backgroundColor:
                                                        chartColors[index % chartColors.length]
                                                }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <strong>{currency(item.value)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="investments-empty-chart">
                            Add an investment to see your portfolio distribution.
                        </div>
                    )}
                </section>

                <section className="investments-panel investments-performance">
                    <div className="investments-panel-heading">
                        <div>
                            <h3>Portfolio Performance</h3>
                            <p>Your overall investment position</p>
                        </div>
                    </div>

                    <div className="investments-performance-value">
                        <span>Current portfolio value</span>
                        <strong>{currency(portfolio.current)}</strong>
                    </div>

                    <div className="investments-performance-row">
                        <span>Invested amount</span>
                        <strong>{currency(portfolio.invested)}</strong>
                    </div>

                    <div className="investments-performance-row">
                        <span>Profit / Loss</span>
                        <strong className={portfolio.profit >= 0 ? "positive" : "negative"}>
                            {portfolio.profit >= 0 ? "+" : ""}
                            {currency(portfolio.profit)}
                        </strong>
                    </div>

                    <div className="investments-performance-row">
                        <span>Return percentage</span>
                        <strong className={portfolio.returns >= 0 ? "positive" : "negative"}>
                            {portfolio.returns.toFixed(2)}%
                        </strong>
                    </div>

                    <div className="investments-performance-note">
                        <FiTrendingUp />
                        <span>
                            {portfolio.profit >= 0
                                ? "Your portfolio is currently showing a gain."
                                : "Your portfolio is currently showing a loss."}
                        </span>
                    </div>
                </section>
            </div>

            {/* Holdings table */}
            <section className="investments-panel investments-holdings">
                <div className="investments-holdings-heading">
                    <div>
                        <h3>My Holdings</h3>
                        <p>Manage and monitor your investment records</p>
                    </div>
                    <span className="investments-count">
                        {investments.length} Investments
                    </span>
                </div>

                <div className="investments-toolbar">
                    <div className="investments-search">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search investment or symbol..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(event) => setFilterType(event.target.value)}
                        className="investments-filter"
                    >
                        <option value="All">All Types</option>
                        {investmentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="investments-table-scroll">
                    <table className="investments-table">
                        <thead>
                            <tr>
                                <th>Investment</th>
                                <th>Type</th>
                                <th>Units</th>
                                <th>Buy Price</th>
                                <th>Current Price</th>
                                <th>Invested</th>
                                <th>Current Value</th>
                                <th>Profit / Loss</th>
                                <th>Return</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredInvestments.map((item) => {
                                const profit = getInvestmentProfit(item);
                                const returns = getInvestmentReturn(item);

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="investment-name-cell">
                                                <strong>{item.name}</strong>
                                                <span>{item.symbol || "—"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="investment-type">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td>{item.units}</td>
                                        <td>{currency(item.avgBuyPrice)}</td>
                                        <td>{currency(item.currentPrice)}</td>
                                        <td>{currency(getInvestmentCost(item))}</td>
                                        <td>
                                            <strong>
                                                {currency(getInvestmentValue(item))}
                                            </strong>
                                        </td>
                                        <td className={profit >= 0 ? "positive" : "negative"}>
                                            {profit >= 0 ? "+" : ""}
                                            {currency(profit)}
                                        </td>
                                        <td>
                                            <span className={`investment-return ${
                                                returns >= 0 ? "positive-bg" : "negative-bg"
                                            }`}>
                                                {returns >= 0 ? "+" : ""}
                                                {returns.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="investments-actions">
                                                <button
                                                    type="button"
                                                    title="Edit"
                                                    onClick={() => openEditModal(item)}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    className="delete"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredInvestments.length === 0 && (
                                <tr>
                                    <td colSpan="10">
                                        <div className="investments-empty-table">
                                            No investments found. Add an investment
                                            or change your search.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add/Edit modal */}
            {showModal && (
                <div
                    className="investments-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="investments-modal">
                        <div className="investments-modal-heading">
                            <div>
                                <h2>
                                    {editingInvestment
                                        ? "Edit Investment"
                                        : "Add New Investment"}
                                </h2>
                                <p>
                                    Enter the details of your investment holding.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="investments-modal-close"
                                onClick={closeModal}
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="investments-form-grid">
                                <label className="investments-form-full">
                                    Investment Name *
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Infosys"
                                        required
                                    />
                                </label>

                                <label>
                                    Investment Type *
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                    >
                                        {investmentTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Symbol / Code
                                    <input
                                        name="symbol"
                                        value={form.symbol}
                                        onChange={handleChange}
                                        placeholder="e.g. INFY"
                                    />
                                </label>

                                <label>
                                    Units *
                                    <input
                                        type="number"
                                        name="units"
                                        min="0.0001"
                                        step="any"
                                        value={form.units}
                                        onChange={handleChange}
                                        placeholder="Number of units"
                                        required
                                    />
                                </label>

                                <label>
                                    Average Buy Price (₹) *
                                    <input
                                        type="number"
                                        name="avgBuyPrice"
                                        min="0.01"
                                        step="any"
                                        value={form.avgBuyPrice}
                                        onChange={handleChange}
                                        placeholder="Purchase price"
                                        required
                                    />
                                </label>

                                <label>
                                    Current Price (₹) *
                                    <input
                                        type="number"
                                        name="currentPrice"
                                        min="0.01"
                                        step="any"
                                        value={form.currentPrice}
                                        onChange={handleChange}
                                        placeholder="Current price"
                                        required
                                    />
                                </label>

                                <label>
                                    Purchase Date *
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            </div>

                            {error && (
                                <p className="investments-form-error">
                                    {error}
                                </p>
                            )}

                            <div className="investments-modal-actions">
                                <button
                                    type="button"
                                    className="investments-cancel"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="investments-save"
                                >
                                    {editingInvestment
                                        ? "Save Changes"
                                        : "Add Investment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}