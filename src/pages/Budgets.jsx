import { useMemo, useState } from "react";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiTarget,
    FiTrendingUp,
    FiAlertCircle
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const categories = [
    "Food",
    "Rent",
    "Shopping",
    "Bills",
    "Travel",
    "Health",
    "Education",
    "Entertainment",
    "Other"
];

const currentMonth = "2026-11";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

function Budgets() {
    const {
        budgets,
        expenses,
        addRecord,
        updateRecord,
        deleteRecord
    } = useFinance();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [form, setForm] = useState({
        category: "Food",
        limit: "",
        month: currentMonth,
        note: ""
    });

    const monthBudgets = useMemo(
        () => budgets.filter((budget) => budget.month === selectedMonth),
        [budgets, selectedMonth]
    );

    const budgetDetails = monthBudgets.map((budget) => {
        const spent = expenses
            .filter(
                (expense) =>
                    expense.category === budget.category &&
                    expense.date?.startsWith(budget.month)
            )
            .reduce(
                (total, expense) => total + Number(expense.amount || 0),
                0
            );

        const limit = Number(budget.limit || 0);
        const percentage = limit > 0
            ? Math.min((spent / limit) * 100, 100)
            : 0;

        return {
            ...budget,
            spent,
            remaining: Math.max(limit - spent, 0),
            percentage,
            exceeded: spent > limit
        };
    });

    const totalBudget = budgetDetails.reduce(
        (total, budget) => total + Number(budget.limit),
        0
    );

    const totalSpent = budgetDetails.reduce(
        (total, budget) => total + budget.spent,
        0
    );

    const totalRemaining = Math.max(totalBudget - totalSpent, 0);

    const openAddForm = () => {
        setEditingBudget(null);
        setForm({
            category: "Food",
            limit: "",
            month: selectedMonth,
            note: ""
        });
        setShowForm(true);
    };

    const openEditForm = (budget) => {
        setEditingBudget(budget);
        setForm({
            category: budget.category,
            limit: budget.limit,
            month: budget.month,
            note: budget.note || ""
        });
        setShowForm(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.limit || Number(form.limit) <= 0) {
            alert("Please enter a valid budget amount.");
            return;
        }

        const record = {
            ...form,
            limit: Number(form.limit)
        };

        if (editingBudget) {
            updateRecord("budgets", {
                ...record,
                id: editingBudget.id
            });
        } else {
            addRecord("budgets", record);
        }

        setShowForm(false);
        setEditingBudget(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this budget?")) {
            deleteRecord("budgets", id);
        }
    };

    return (
        <div className="finance-page">
            <div className="finance-page-heading">
                <div>
                    <h1>Monthly Budgets</h1>
                    <p>Plan your spending and stay within your limits.</p>
                </div>

                <button className="finance-add-button" onClick={openAddForm}>
                    <FiPlus /> Create Budget
                </button>
            </div>

            <div className="budget-toolbar">
                <label>
                    Select month
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(event.target.value)
                        }
                    />
                </label>
            </div>

            <div className="finance-summary-grid">
                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiTarget />
                    </div>
                    <div>
                        <span>Total Budget</span>
                        <h2>{formatCurrency(totalBudget)}</h2>
                    </div>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiTrendingUp />
                    </div>
                    <div>
                        <span>Total Spent</span>
                        <h2>{formatCurrency(totalSpent)}</h2>
                    </div>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiAlertCircle />
                    </div>
                    <div>
                        <span>Remaining</span>
                        <h2>{formatCurrency(totalRemaining)}</h2>
                    </div>
                </div>
            </div>

            <section className="budget-list-section">
                <div className="finance-table-heading">
                    <div>
                        <h2>Category Budgets</h2>
                        <p>Track how much you spend in each category.</p>
                    </div>
                    <span>{budgetDetails.length} budgets</span>
                </div>

                {budgetDetails.length === 0 ? (
                    <div className="finance-empty">
                        <FiTarget />
                        <h3>No budgets for this month</h3>
                        <p>Create a budget to start tracking your spending.</p>
                        <button
                            className="finance-add-button"
                            onClick={openAddForm}
                        >
                            <FiPlus /> Create Budget
                        </button>
                    </div>
                ) : (
                    <div className="budget-grid">
                        {budgetDetails.map((budget) => (
                            <article className="budget-card" key={budget.id}>
                                <div className="budget-card-top">
                                    <div>
                                        <h3>{budget.category}</h3>
                                        <p>{budget.note || "Monthly budget"}</p>
                                    </div>

                                    <div className="finance-actions">
                                        <button
                                            title="Edit budget"
                                            onClick={() => openEditForm(budget)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            title="Delete budget"
                                            onClick={() => handleDelete(budget.id)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>

                                <div className="budget-amounts">
                                    <div>
                                        <span>Spent</span>
                                        <strong>{formatCurrency(budget.spent)}</strong>
                                    </div>
                                    <div>
                                        <span>Budget limit</span>
                                        <strong>{formatCurrency(budget.limit)}</strong>
                                    </div>
                                </div>

                                <div className="budget-progress-track">
                                    <div
                                        className={`budget-progress-fill ${
                                            budget.exceeded ? "over-budget" : ""
                                        }`}
                                        style={{
                                            width: `${budget.percentage}%`
                                        }}
                                    />
                                </div>

                                <div className="budget-card-bottom">
                                    <span>
                                        {Math.round(
                                            (budget.spent / budget.limit) * 100
                                        ) || 0}% used
                                    </span>

                                    <strong
                                        className={
                                            budget.exceeded
                                                ? "budget-warning"
                                                : ""
                                        }
                                    >
                                        {budget.exceeded
                                            ? `${formatCurrency(
                                                budget.spent - budget.limit
                                            )} over`
                                            : `${formatCurrency(
                                                budget.remaining
                                            )} left`}
                                    </strong>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {showForm && (
                <div
                    className="finance-modal-overlay"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="finance-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="finance-modal-heading">
                            <h2>
                                {editingBudget ? "Edit Budget" : "Create Budget"}
                            </h2>
                            <button onClick={() => setShowForm(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>
                                Category
                                <select
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            category: event.target.value
                                        })
                                    }
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Budget amount (₹)
                                <input
                                    type="number"
                                    min="1"
                                    value={form.limit}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            limit: event.target.value
                                        })
                                    }
                                    placeholder="Enter budget amount"
                                    required
                                />
                            </label>

                            <label>
                                Month
                                <input
                                    type="month"
                                    value={form.month}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            month: event.target.value
                                        })
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Note
                                <input
                                    type="text"
                                    value={form.note}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            note: event.target.value
                                        })
                                    }
                                    placeholder="Optional note"
                                />
                            </label>

                            <div className="finance-modal-actions">
                                <button
                                    type="button"
                                    className="finance-cancel"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="finance-save">
                                    {editingBudget ? "Update Budget" : "Save Budget"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Budgets;