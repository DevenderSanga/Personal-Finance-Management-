
import { useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiTrendingUp,
    FiTrendingDown
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const categories = {
    income: ["Salary", "Freelance", "Business", "Investment", "Other"],
    expenses: ["Food", "Rent", "Shopping", "Travel", "Bills", "Health", "Education", "Entertainment", "Other"]
};

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

const today = () => new Date().toLocaleDateString("en-CA");

const emptyForm = {
    title: "",
    amount: "",
    category: "",
    date: today(),
    note: ""
};

function FinanceManager({ type }) {
    const isIncome = type === "income";

    const {
        income,
        expenses,
        addRecord,
        updateRecord,
        deleteRecord
    } = useFinance();

    const records = isIncome ? income : expenses;

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    const total = records.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const filteredRecords = useMemo(() => {
        return records
            .filter((item) => {
                const matchesSearch =
                    item.title.toLowerCase().includes(search.toLowerCase()) ||
                    item.category.toLowerCase().includes(search.toLowerCase());

                const matchesCategory =
                    categoryFilter === "All" ||
                    item.category === categoryFilter;

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [records, search, categoryFilter]);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setShowForm(true);
    };

    const openEditForm = (record) => {
        setEditingId(record.id);
        setForm({
            title: record.title,
            amount: String(record.amount),
            category: record.category,
            date: record.date,
            note: record.note || ""
        });
        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const amount = Number(form.amount);

        if (!form.title.trim()) {
            setError("Please enter a transaction title.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Please enter a valid amount greater than zero.");
            return;
        }

        if (!form.category || !form.date) {
            setError("Please select a category and date.");
            return;
        }

        const record = {
            ...form,
            title: form.title.trim(),
            amount,
            note: form.note.trim()
        };

        if (editingId) {
            updateRecord(type, {
                ...record,
                id: editingId
            });
        } else {
            addRecord(type, record);
        }

        closeForm();
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete this ${isIncome ? "income" : "expense"}?`
        );

        if (confirmed) {
            deleteRecord(type, id);
        }
    };

    return (
        <div className="finance-page">
            <div className="finance-page-heading">
                <div>
                    <h1>{isIncome ? "Income Management" : "Expense Tracking"}</h1>
                    <p>
                        {isIncome
                            ? "Manage and monitor all your income sources."
                            : "Track and manage your everyday spending."}
                    </p>
                </div>

                <button className="finance-add-button" onClick={openAddForm}>
                    <FiPlus />
                    Add {isIncome ? "Income" : "Expense"}
                </button>
            </div>

            <div className="finance-summary-grid">
                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        {isIncome ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <p>Total {isIncome ? "Income" : "Expenses"}</p>
                    <h2>{currency(total)}</h2>
                    <span>{records.length} records</span>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiSearch />
                    </div>
                    <p>Average per record</p>
                    <h2>
                        {currency(records.length ? total / records.length : 0)}
                    </h2>
                    <span>Based on all records</span>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiPlus />
                    </div>
                    <p>Categories used</p>
                    <h2>
                        {new Set(records.map((item) => item.category)).size}
                    </h2>
                    <span>Different categories</span>
                </div>
            </div>

            <section className="finance-table-card">
                <div className="finance-table-heading">
                    <div>
                        <h3>{isIncome ? "Income Records" : "Expense Records"}</h3>
                        <p>View and manage your financial records.</p>
                    </div>
                </div>

                <div className="finance-filters">
                    <div className="finance-search">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by title or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {categories[type].map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="finance-table-scroll">
                    <table className="finance-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td className="finance-record-title">
                                            {record.title}
                                        </td>
                                        <td>
                                            <span className="finance-category">
                                                {record.category}
                                            </span>
                                        </td>
                                        <td>{record.date}</td>
                                        <td className={isIncome ? "income-text" : "expense-text"}>
                                            {isIncome ? "+" : "-"}{currency(record.amount)}
                                        </td>
                                        <td>{record.note || "—"}</td>
                                        <td>
                                            <div className="finance-actions">
                                                <button
                                                    className="finance-edit"
                                                    onClick={() => openEditForm(record)}
                                                    title="Edit"
                                                    aria-label={`Edit ${record.title}`}
                                                >
                                                    <FiEdit2 />
                                                </button>

                                                <button
                                                    className="finance-delete"
                                                    onClick={() => handleDelete(record.id)}
                                                    title="Delete"
                                                    aria-label={`Delete ${record.title}`}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="finance-empty">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {showForm && (
                <div className="finance-modal-overlay" onClick={closeForm}>
                    <div
                        className="finance-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="finance-modal-heading">
                            <div>
                                <h2>
                                    {editingId ? "Edit" : "Add"} {isIncome ? "Income" : "Expense"}
                                </h2>
                                <p>Enter your financial record details.</p>
                            </div>

                            <button onClick={closeForm} aria-label="Close form">
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter transaction title"
                            />

                            <label>Amount (₹)</label>
                            <input
                                name="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                            />

                            <label>Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="">Select category</option>
                                {categories[type].map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <label>Date</label>
                            <input
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                            />

                            <label>Note (optional)</label>
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                placeholder="Add a note..."
                                rows="3"
                            />

                            {error && (
                                <p className="finance-form-error">{error}</p>
                            )}

                            <div className="finance-modal-actions">
                                <button
                                    type="button"
                                    className="finance-cancel"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="finance-save">
                                    {editingId ? "Update Record" : "Save Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FinanceManager;
