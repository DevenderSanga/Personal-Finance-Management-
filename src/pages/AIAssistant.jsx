
import { useMemo, useState } from "react";
import {
    FiSend,
    FiMessageCircle,
    FiTrendingUp,
    FiTrendingDown,
    FiTarget,
    FiDollarSign,
    FiRefreshCw,
    FiUser,
    FiCpu,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount || 0);

const getMonth = () => {
    const date = new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
};

function AIAssistant() {
    const {
        income,
        expenses,
        budgets,
        savingsGoals,
    } = useFinance();

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "assistant",
            text: "Hello! I'm your FinWise Financial Assistant. I can help you understand your spending, review your budgets, and find ways to save money. What would you like to know?",
            time: new Date(),
        },
    ]);

    const currentMonth = getMonth();

    const monthlyIncome = useMemo(
        () =>
            income
                .filter((item) =>
                    item.date?.startsWith(currentMonth)
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount || 0),
                    0
                ),
        [income, currentMonth]
    );

    const monthlyExpenses = useMemo(
        () =>
            expenses
                .filter((item) =>
                    item.date?.startsWith(currentMonth)
                )
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount || 0),
                    0
                ),
        [expenses, currentMonth]
    );

    const totalIncome = income.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const totalExpenses = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    const savingsRate =
        monthlyIncome > 0
            ? (monthlyBalance / monthlyIncome) * 100
            : 0;

    const totalSaved = savingsGoals.reduce(
        (sum, goal) =>
            sum + Number(goal.savedAmount || 0),
        0
    );

    const totalTarget = savingsGoals.reduce(
        (sum, goal) =>
            sum + Number(goal.targetAmount || 0),
        0
    );

    const categorySpending = useMemo(() => {
        const totals = {};

        expenses
            .filter((item) =>
                item.date?.startsWith(currentMonth)
            )
            .forEach((item) => {
                const category = item.category || "Other";

                totals[category] =
                    (totals[category] || 0) +
                    Number(item.amount || 0);
            });

        return Object.entries(totals)
            .map(([name, amount]) => ({
                name,
                amount,
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, currentMonth]);

    const topCategory = categorySpending[0];
    
    const budgetInsights = budgets
        .filter((item) => item.month === currentMonth)
        .map((budget) => {
            const spent = expenses
                .filter(
                    (expense) =>
                        expense.category === budget.category &&
                        expense.date?.startsWith(currentMonth)
                )
                .reduce(
                    (sum, expense) =>
                        sum + Number(expense.amount || 0),
                    0
                );

            const limit = Number(budget.amount || 0);

            return {
                category: budget.category,
                limit,
                spent,
                remaining: limit - spent,
            };
        });

    // Generate insights using existing financial data.
    // This is a local rule-based assistant, not a live AI API.
    const generateResponse = (question) => {
        const q = question.toLowerCase();

        const topCategory = categorySpending[0];

        if (
            q.includes("help") ||
            q.includes("what can you do")
        ) {
            return "I can help you review your monthly income, expenses, savings rate, budgets, spending categories, and savings goals. Try asking: 'Where am I spending the most?' or 'How can I save more money?'";
        }

        if (
            q.includes("income") ||
            q.includes("earning") ||
            q.includes("salary")
        ) {
            return `Your income for this month is ${currency(monthlyIncome)}. Your total recorded income across all periods is ${currency(totalIncome)}. Keep tracking all your income sources to get a clearer financial picture.`;
        }

        if (
            q.includes("expense") ||
            q.includes("spending") ||
            q.includes("spent")
        ) {
            return `You have spent ${currency(monthlyExpenses)} this month. Your all-time recorded expenses are ${currency(totalExpenses)}.${topCategory ? ` Your highest spending category this month is ${topCategory.name}, with ${currency(topCategory.amount)} spent.` : " There are no expense records for this month yet."}`;
        }

        if (
            q.includes("category") ||
            q.includes("where") ||
            q.includes("most")
        ) {
            if (!topCategory) {
                return "You don't have any expense records for this month yet. Add your expenses to see which categories use the most money.";
            }

            return `Your highest spending category this month is ${topCategory.name}, with ${currency(topCategory.amount)} spent.${categorySpending.length > 1 ? ` Your next highest category is ${categorySpending[1].name}, at ${currency(categorySpending[1].amount)}.` : ""} Consider reviewing these expenses to find possible savings.`;
        }

        if (
            q.includes("budget") ||
            q.includes("limit")
        ) {
            if (budgetInsights.length === 0) {
                return "You haven't created any budgets for this month. Visit the Budgets page and set monthly limits for categories such as Food, Shopping, Rent, and Travel.";
            }

            const exceeded = budgetInsights.filter(
                (item) => item.spent > item.limit
            );

            const nearLimit = budgetInsights.filter(
                (item) =>
                    item.limit > 0 &&
                    item.spent <= item.limit &&
                    item.spent / item.limit >= 0.8
            );

            const summary = budgetInsights
                .map(
                    (item) =>
                        `${item.category}: ${currency(item.spent)} spent out of ${currency(item.limit)}`
                )
                .join("; ");

            return `Here is your budget review: ${summary}.${exceeded.length ? ` You have exceeded the budget for ${exceeded.map((item) => item.category).join(", ")}.` : " None of your tracked categories have exceeded their limits."}${nearLimit.length ? ` Keep an eye on ${nearLimit.map((item) => item.category).join(", ")} because these budgets are at least 80% used.` : ""}`;
        }

        if (
            q.includes("saving") ||
            q.includes("save money")
        ) {
            const suggestions = [];

            if (monthlyIncome <= 0) {
                suggestions.push(
                    "Record your monthly income to calculate a reliable savings target."
                );
            } else if (monthlyBalance <= 0) {
                suggestions.push(
                    "Your expenses currently equal or exceed your income. Review non-essential spending first."
                );
            } else {
                suggestions.push(
                    `Your current monthly surplus is ${currency(monthlyBalance)}. Consider setting aside a portion of it toward your savings goals.`
                );
            }

            if (topCategory) {
                suggestions.push(
                    `Review your ${topCategory.name} spending of ${currency(topCategory.amount)} for possible reductions.`
                );
            }

            return `Your recorded savings across all goals are ${currency(totalSaved)} out of ${currency(totalTarget)}. ${suggestions.join(" ")}`;
        }

        if (
            q.includes("goal") ||
            q.includes("target")
        ) {
            if (savingsGoals.length === 0) {
                return "You haven't created any savings goals yet. Visit Savings Goals to create targets such as an Emergency Fund, New Laptop, or Vacation.";
            }

            const details = savingsGoals.map((goal) => {
                const saved = Number(goal.savedAmount || 0);
                const target = Number(goal.targetAmount || 0);

                const percentage =
                    target > 0
                        ? ((saved / target) * 100).toFixed(1)
                        : 0;

                return `${goal.name}: ${currency(saved)} saved out of ${currency(target)} (${percentage}%)`;
            });

            return `Here is your savings goal progress: ${details.join("; ")}. Keep making consistent contributions toward your targets.`;
        }

        if (
            q.includes("balance") ||
            q.includes("left") ||
            q.includes("surplus")
        ) {
            return `Your income this month is ${currency(monthlyIncome)} and your expenses are ${currency(monthlyExpenses)}. Your current monthly balance is ${currency(monthlyBalance)}. ${
                monthlyBalance > 0
                    ? "You have a positive balance based on your recorded transactions."
                    : monthlyBalance < 0
                        ? "Your expenses exceed your recorded income. Review your spending."
                        : "Your recorded income and expenses are currently equal."
            }`;
        }

        if (
            q.includes("overview") ||
            q.includes("summary") ||
            q.includes("financial")
        ) {
            return `Here is your financial summary: Monthly income: ${currency(monthlyIncome)}. Monthly expenses: ${currency(monthlyExpenses)}. Monthly balance: ${currency(monthlyBalance)}. Savings rate: ${savingsRate.toFixed(1)}%. Total savings across goals: ${currency(totalSaved)}. ${
                monthlyBalance > 0
                    ? "You have a positive monthly balance. Consider directing part of it toward your savings goals."
                    : "Consider reviewing your expenses and adjusting your budget."
            }`;
        }

        return "I can help you with income, expenses, budgets, spending categories, savings, and financial summaries. Try asking one of these questions: 'How much did I spend this month?', 'Where am I spending the most?', 'Am I exceeding my budget?', or 'How can I save more money?'";
    };

    const sendMessage = (text = message) => {
        const question = text.trim();

        if (!question || loading) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: question,
            time: new Date(),
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setMessage("");
        setLoading(true);

        // Simulated assistant response using local financial data.
        setTimeout(() => {
            const answer = generateResponse(question);

            setMessages((previous) => [
                ...previous,
                {
                    id: Date.now() + 1,
                    sender: "assistant",
                    text: answer,
                    time: new Date(),
                },
            ]);

            setLoading(false);
        }, 500);
    };

    const suggestions = [
        "Give me my financial summary",
        "Where am I spending the most?",
        "Am I exceeding my budget?",
        "How can I save more money?",
    ];

    const clearChat = () => {
        setMessages([
            {
                id: Date.now(),
                sender: "assistant",
                text: "Hello! I'm your FinWise Financial Assistant. What would you like to know about your finances?",
                time: new Date(),
            },
        ]);
    };

    const insights = [
        {
            title: "Monthly Balance",
            value: currency(monthlyBalance),
            description:
                monthlyBalance >= 0
                    ? "Positive balance"
                    : "Expenses exceed income",
            icon: <FiDollarSign />,
            type: monthlyBalance >= 0 ? "positive" : "warning",
        },
        {
            title: "Savings Rate",
            value: `${savingsRate.toFixed(1)}%`,
            description: "Based on monthly income",
            icon: <FiTrendingUp />,
            type: "positive",
        },
        {
            title: "Top Spending",
            value: topCategory?.name || "No data",
            description: topCategory
                ? currency(topCategory.amount) + " this month"
                : "Add expense records",
            icon: <FiTrendingDown />,
            type: "warning",
        },
        {
            title: "Savings Progress",
            value:
                totalTarget > 0
                    ? `${((totalSaved / totalTarget) * 100).toFixed(1)}%`
                    : "0%",
            description: `${currency(totalSaved)} saved`,
            icon: <FiTarget />,
            type: "positive",
        },
    ];

    return (
        <div className="ai-page">

            {/* Heading */}
            <div className="ai-page-heading">
                <div>
                    <h1>AI Financial Assistant</h1>
                    <p>
                        Your personal companion for smarter financial decisions.
                    </p>
                </div>

                <div className="ai-status">
                    <span />
                    Demo Assistant Active
                </div>
            </div>

            {/* Insights */}
            <div className="ai-insights-grid">
                {insights.map((item) => (
                    <div className="ai-insight-card" key={item.title}>
                        <div className={`ai-insight-icon ${item.type}`}>
                            {item.icon}
                        </div>

                        <div>
                            <span>{item.title}</span>
                            <h3>{item.value}</h3>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat and Side Panel */}
            <div className="ai-main-grid">

                <section className="ai-chat-card">

                    <div className="ai-chat-header">
                        <div className="ai-chat-profile">
                            <div className="ai-avatar">
                                <FiCpu />
                            </div>

                            <div>
                                <h3>FinWise Assistant</h3>
                                <span>
                                    <i /> Ready to help
                                </span>
                            </div>
                        </div>

                        <button
                            className="ai-clear-button"
                            onClick={clearChat}
                            title="Clear conversation"
                        >
                            <FiRefreshCw />
                            Clear
                        </button>
                    </div>

                    <div className="ai-messages">
                        {messages.map((item) => (
                            <div
                                key={item.id}
                                className={`ai-message-row ${
                                    item.sender === "user"
                                        ? "user-row"
                                        : "assistant-row"
                                }`}
                            >
                                <div className="ai-message-avatar">
                                    {item.sender === "user" ? (
                                        <FiUser />
                                    ) : (
                                        <FiCpu />
                                    )}
                                </div>

                                <div className="ai-message-content">
                                    <div className="ai-message-name">
                                        {item.sender === "user"
                                            ? "You"
                                            : "FinWise Assistant"}
                                    </div>

                                    <div className="ai-message-bubble">
                                        {item.text}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message-row assistant-row">
                                <div className="ai-message-avatar">
                                    <FiCpu />
                                </div>
                                <div className="ai-message-content">
                                    <div className="ai-message-name">
                                        FinWise Assistant
                                    </div>
                                    <div className="ai-typing">
                                        Analyzing your financial data...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ai-chat-input-area">
                        <form
                            className="ai-chat-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Ask something about your finances..."
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                            />

                            <button
                                type="submit"
                                disabled={!message.trim() || loading}
                            >
                                <FiSend />
                            </button>
                        </form>

                        <p>
                            Demo assistant uses your saved FinWise data.
                            It does not connect to a live AI service.
                        </p>
                    </div>
                </section>

                {/* Suggestions */}
                <aside className="ai-side-panel">

                    <div className="ai-side-card">
                        <div className="ai-side-heading">
                            <FiMessageCircle />
                            <h3>Suggested Questions</h3>
                        </div>

                        <p className="ai-side-description">
                            Choose a question to start a conversation.
                        </p>

                        <div className="ai-suggestions">
                            {suggestions.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => sendMessage(item)}
                                    disabled={loading}
                                >
                                    {item}
                                    <FiSend />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ai-side-card">
                        <div className="ai-side-heading">
                            <FiAlertCircle />
                            <h3>Smart Recommendations</h3>
                        </div>

                        <div className="ai-recommendations">

                            {monthlyIncome <= 0 ? (
                                <div className="ai-recommendation">
                                    <FiAlertCircle />
                                    <p>
                                        Add your income records to receive
                                        more useful financial insights.
                                    </p>
                                </div>
                            ) : monthlyBalance < 0 ? (
                                <div className="ai-recommendation warning">
                                    <FiAlertCircle />
                                    <p>
                                        Your monthly expenses exceed your
                                        income. Review non-essential spending.
                                    </p>
                                </div>
                            ) : (
                                <div className="ai-recommendation">
                                    <FiCheckCircle />
                                    <p>
                                        You have a positive monthly balance.
                                        Consider allocating some money to
                                        savings goals.
                                    </p>
                                </div>
                            )}

                            {topCategory && (
                                <div className="ai-recommendation">
                                    <FiTrendingDown />
                                    <p>
                                        Review your {topCategory.name} spending
                                        of {currency(topCategory.amount)}.
                                    </p>
                                </div>
                            )}

                            {budgetInsights.some(
                                (item) => item.spent > item.limit
                            ) && (
                                <div className="ai-recommendation warning">
                                    <FiAlertCircle />
                                    <p>
                                        At least one category has exceeded
                                        its monthly budget.
                                    </p>
                                </div>
                            )}

                            {savingsGoals.length === 0 && (
                                <div className="ai-recommendation">
                                    <FiTarget />
                                    <p>
                                        Create a savings goal to start tracking
                                        your financial targets.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="ai-disclaimer">
                        <FiAlertCircle />
                        <p>
                            These are automated demo insights based on your
                            recorded data, not professional financial advice.
                        </p>
                    </div>

                </aside>
            </div>
        </div>
    );
}

export default AIAssistant;
