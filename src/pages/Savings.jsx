import { useState } from "react";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiTarget,
    FiTrendingUp,
    FiDollarSign
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

function Savings() {
    const {
        savingsGoals,
        addRecord,
        updateRecord,
        deleteRecord,
        addContribution
    } = useFinance();

    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [contributionGoal, setContributionGoal] = useState(null);
    const [contributionAmount, setContributionAmount] = useState("");

    const [form, setForm] = useState({
        title: "",
        category: "Personal",
        targetAmount: "",
        savedAmount: "",
        targetDate: "",
        note: ""
    });

    const totalTarget = savingsGoals.reduce(
        (total, goal) => total + Number(goal.targetAmount || 0),
        0
    );

    const totalSaved = savingsGoals.reduce(
        (total, goal) => total + Number(goal.savedAmount || 0),
        0
    );

    const overallProgress = totalTarget > 0
        ? Math.min((totalSaved / totalTarget) * 100, 100)
        : 0;

    const openAddForm = () => {
        setEditingGoal(null);
        setForm({
            title: "",
            category: "Personal",
            targetAmount: "",
            savedAmount: "0",
            targetDate: "",
            note: ""
        });
        setShowForm(true);
    };

    const openEditForm = (goal) => {
        setEditingGoal(goal);
        setForm({
            title: goal.title,
            category: goal.category,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            targetDate: goal.targetDate,
            note: goal.note || ""
        });
        setShowForm(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const target = Number(form.targetAmount);
        const saved = Number(form.savedAmount);

        if (
            !form.title.trim() ||
            target <= 0 ||
            saved < 0 ||
            saved > target
        ) {
            alert("Enter valid goal details. Saved amount cannot exceed the target.");
            return;
        }

        const record = {
            ...form,
            title: form.title.trim(),
            targetAmount: target,
            savedAmount: saved
        };

        if (editingGoal) {
            updateRecord("savingsGoals", {
                ...record,
                id: editingGoal.id
            });
        } else {
            addRecord("savingsGoals", record);
        }

        setShowForm(false);
        setEditingGoal(null);
    };

    const handleContribution = (event) => {
        event.preventDefault();

        const amount = Number(contributionAmount);

        if (!amount || amount <= 0) {
            alert("Enter a valid contribution amount.");
            return;
        }

        const remaining =
            Number(contributionGoal.targetAmount) -
            Number(contributionGoal.savedAmount);

        if (amount > remaining) {
            alert(`You can contribute up to ${formatCurrency(remaining)}.`);
            return;
        }

        addContribution(contributionGoal.id, amount);
        setContributionGoal(null);
        setContributionAmount("");
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this savings goal?")) {
            deleteRecord("savingsGoals", id);
        }
    };

    return (
        <div className="finance-page">
            <div className="finance-page-heading">
                <div>
                    <h1>Savings Goals</h1>
                    <p>Set financial goals and track your savings progress.</p>
                </div>

                <button className="finance-add-button" onClick={openAddForm}>
                    <FiPlus /> Create Goal
                </button>
            </div>

            <div className="finance-summary-grid">
                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiTarget />
                    </div>
                    <div>
                        <span>Total Target</span>
                        <h2>{formatCurrency(totalTarget)}</h2>
                    </div>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiDollarSign />
                    </div>
                    <div>
                        <span>Total Saved</span>
                        <h2>{formatCurrency(totalSaved)}</h2>
                    </div>
                </div>

                <div className="finance-summary-card">
                    <div className="finance-summary-icon">
                        <FiTrendingUp />
                    </div>
                    <div>
                        <span>Overall Progress</span>
                        <h2>{Math.round(overallProgress)}%</h2>
                    </div>
                </div>
            </div>

            <section className="savings-overview-card">
                <div>
                    <h2>Your savings progress</h2>
                    <p>
                        You've saved {formatCurrency(totalSaved)} out of{" "}
                        {formatCurrency(totalTarget)}.
                    </p>
                </div>

                <div className="savings-main-progress">
                    <div
                        className="savings-main-progress-fill"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>

                <strong>{Math.round(overallProgress)}% completed</strong>
            </section>

            <section className="savings-list-section">
                <div className="finance-table-heading">
                    <div>
                        <h2>Your Goals</h2>
                        <p>Keep moving towards your financial milestones.</p>
                    </div>
                    <span>{savingsGoals.length} goals</span>
                </div>

                {savingsGoals.length === 0 ? (
                    <div className="finance-empty">
                        <FiTarget />
                        <h3>No savings goals yet</h3>
                        <p>Create your first goal and start saving.</p>
                        <button
                            className="finance-add-button"
                            onClick={openAddForm}
                        >
                            <FiPlus /> Create Goal
                        </button>
                    </div>
                ) : (
                    <div className="savings-grid">
                        {savingsGoals.map((goal) => {
                            const target = Number(goal.targetAmount);
                            const saved = Number(goal.savedAmount);
                            const percentage = target > 0
                                ? Math.min((saved / target) * 100, 100)
                                : 0;

                            const completed = saved >= target;

                            return (
                                <article className="savings-card" key={goal.id}>
                                    <div className="savings-card-top">
                                        <div className="savings-goal-icon">
                                            <FiTarget />
                                        </div>

                                        <div className="finance-actions">
                                            <button
                                                title="Edit goal"
                                                onClick={() => openEditForm(goal)}
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                title="Delete goal"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    <h3>{goal.title}</h3>
                                    <span className="savings-category">
                                        {goal.category}
                                    </span>

                                    <div className="savings-amount-row">
                                        <div>
                                            <span>Saved</span>
                                            <strong>{formatCurrency(saved)}</strong>
                                        </div>
                                        <div>
                                            <span>Target</span>
                                            <strong>{formatCurrency(target)}</strong>
                                        </div>
                                    </div>

                                    <div className="budget-progress-track">
                                        <div
                                            className="savings-progress-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <div className="budget-card-bottom">
                                        <span>{Math.round(percentage)}% completed</span>
                                        <strong>
                                            {completed
                                                ? "Goal achieved!"
                                                : `${formatCurrency(target - saved)} left`}
                                        </strong>
                                    </div>

                                    <div className="savings-card-footer">
                                        <span>
                                            Target: {goal.targetDate || "Not set"}
                                        </span>

                                        <button
                                            disabled={completed}
                                            onClick={() => {
                                                setContributionGoal(goal);
                                                setContributionAmount("");
                                            }}
                                        >
                                            <FiPlus /> Add Savings
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
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
                            <h2>{editingGoal ? "Edit Goal" : "Create Savings Goal"}</h2>
                            <button onClick={() => setShowForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>
                                Goal name
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(event) =>
                                        setForm({ ...form, title: event.target.value })
                                    }
                                    placeholder="Example: New Laptop"
                                    required
                                />
                            </label>

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
                                    <option>Personal</option>
                                    <option>Emergency</option>
                                    <option>Technology</option>
                                    <option>Travel</option>
                                    <option>Education</option>
                                    <option>Vehicle</option>
                                    <option>Home</option>
                                    <option>Other</option>
                                </select>
                            </label>

                            <label>
                                Target amount (₹)
                                <input
                                    type="number"
                                    min="1"
                                    value={form.targetAmount}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            targetAmount: event.target.value
                                        })
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Already saved (₹)
                                <input
                                    type="number"
                                    min="0"
                                    value={form.savedAmount}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            savedAmount: event.target.value
                                        })
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Target date
                                <input
                                    type="date"
                                    value={form.targetDate}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            targetDate: event.target.value
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Note
                                <input
                                    type="text"
                                    value={form.note}
                                    onChange={(event) =>
                                        setForm({ ...form, note: event.target.value })
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
                                    {editingGoal ? "Update Goal" : "Save Goal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {contributionGoal && (
                <div
                    className="finance-modal-overlay"
                    onClick={() => setContributionGoal(null)}
                >
                    <div
                        className="finance-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="finance-modal-heading">
                            <h2>Add Savings</h2>
                            <button onClick={() => setContributionGoal(null)}>
                                ×
                            </button>
                        </div>

                        <p className="contribution-description">
                            Add money to <strong>{contributionGoal.title}</strong>.
                            Remaining target:{" "}
                            {formatCurrency(
                                contributionGoal.targetAmount -
                                contributionGoal.savedAmount
                            )}
                        </p>

                        <form onSubmit={handleContribution}>
                            <label>
                                Contribution amount (₹)
                                <input
                                    type="number"
                                    min="1"
                                    value={contributionAmount}
                                    onChange={(event) =>
                                        setContributionAmount(event.target.value)
                                    }
                                    placeholder="Enter amount"
                                    required
                                />
                            </label>

                            <div className="finance-modal-actions">
                                <button
                                    type="button"
                                    className="finance-cancel"
                                    onClick={() => setContributionGoal(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="finance-save">
                                    Add Contribution
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Savings;