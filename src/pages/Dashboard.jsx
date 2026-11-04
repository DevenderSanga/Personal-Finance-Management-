
import { useMemo } from "react";
import {
    FiDollarSign,
    FiTrendingUp,
    FiTrendingDown,
    FiTarget,
    FiArrowUpRight,
    FiArrowDownRight,
    FiActivity,
    FiBriefcase
} from "react-icons/fi";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import { useFinance } from "../context/FinanceContext";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

const formatShortCurrency = (amount) => {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}k`;
    }

    return `₹${amount}`;
};

const COLORS = [
    "#6477ed",
    "#22a879",
    "#f2a541",
    "#e66b75",
    "#36a6c9",
    "#9875d1",
    "#8995a8",
    "#d18a58"
];

function Dashboard() {
    const {
        income,
        expenses,
        budgets,
        savingsGoals,
        investments = [],
        transactions,
        totalIncome,
        totalExpenses,
        balance
    } = useFinance();

    const savingsTotal = savingsGoals.reduce(
        (total, goal) => total + Number(goal.savedAmount || 0),
        0
    );

    // Investment portfolio calculations
    const investmentPortfolio = useMemo(() => {
        const invested = investments.reduce(
            (total, item) =>
                total +
                Number(item.units || 0) *
                Number(item.avgBuyPrice || 0),
            0
        );

        const current = investments.reduce(
            (total, item) =>
                total +
                Number(item.units || 0) *
                Number(item.currentPrice || 0),
            0
        );

        const profit = current - invested;

        const returns = invested > 0
            ? (profit / invested) * 100
            : 0;

        return {
            invested,
            current,
            profit,
            returns
        };
    }, [investments]);

    // Investment distribution by type
    const investmentDistribution = useMemo(() => {
        const totals = {};

        investments.forEach((item) => {
            const type = item.type || "Other";

            const currentValue =
                Number(item.units || 0) *
                Number(item.currentPrice || 0);

            totals[type] = (totals[type] || 0) + currentValue;
        });

        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [investments]);

    const today = new Date();

    const currentMonth =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const currentMonthIncome = income
        .filter((item) => item.date?.startsWith(currentMonth))
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const currentMonthExpenses = expenses
        .filter((item) => item.date?.startsWith(currentMonth))
        .reduce((total, item) => total + Number(item.amount || 0), 0);

    const currentMonthBudgets = budgets.filter(
        (budget) => budget.month === currentMonth
    );

    const monthlyBudgetLimit = currentMonthBudgets.reduce(
        (total, budget) => total + Number(budget.limit || 0),
        0
    );

    const monthlyBudgetSpent = expenses
        .filter((expense) => expense.date?.startsWith(currentMonth))
        .reduce((total, expense) => total + Number(expense.amount || 0), 0);

    const budgetPercentage = monthlyBudgetLimit > 0
        ? Math.min((monthlyBudgetSpent / monthlyBudgetLimit) * 100, 100)
        : 0;

    // Monthly income and expenses for the last six months
    const monthlyData = useMemo(() => {
        const months = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setDate(1);
            date.setMonth(date.getMonth() - i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const key = `${year}-${month}`;

            const monthIncome = income
                .filter((item) => item.date?.startsWith(key))
                .reduce(
                    (total, item) => total + Number(item.amount || 0),
                    0
                );

            const monthExpenses = expenses
                .filter((item) => item.date?.startsWith(key))
                .reduce(
                    (total, item) => total + Number(item.amount || 0),
                    0
                );

            months.push({
                month: date.toLocaleString("en-IN", { month: "short" }),
                income: monthIncome,
                expenses: monthExpenses
            });
        }

        return months;
    }, [income, expenses]);

    // Expense category chart
    const categoryData = useMemo(() => {
        const totals = {};

        expenses.forEach((expense) => {
            const category = expense.category || "Other";
            totals[category] =
                (totals[category] || 0) + Number(expense.amount || 0);
        });

        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const recentTransactions = transactions.slice(0, 5);
    const recentInvestments = investments.slice(0, 5);

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <div>
                    <h1>Financial Overview</h1>
                    <p>Here's what's happening with your money.</p>
                </div>

                <div className="dashboard-date">
                    {new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                </div>
            </div>

            {/* Summary Cards */}
            <section className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon balance-icon">
                            <FiDollarSign />
                        </div>
                        <span className="dashboard-stat-label">Total Balance</span>
                    </div>
                    <h2>{formatCurrency(balance)}</h2>
                    <p>Income minus expenses</p>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon income-icon">
                            <FiTrendingUp />
                        </div>
                        <span className="dashboard-stat-label">Total Income</span>
                    </div>
                    <h2>{formatCurrency(totalIncome)}</h2>
                    <p><FiArrowUpRight /> {income.length} income records</p>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon expense-icon">
                            <FiTrendingDown />
                        </div>
                        <span className="dashboard-stat-label">Total Expenses</span>
                    </div>
                    <h2>{formatCurrency(totalExpenses)}</h2>
                    <p><FiArrowDownRight /> {expenses.length} expense records</p>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon savings-icon">
                            <FiTarget />
                        </div>
                        <span className="dashboard-stat-label">Total Savings</span>
                    </div>
                    <h2>{formatCurrency(savingsTotal)}</h2>
                    <p>{savingsGoals.length} active savings goals</p>
                </div>
            </section>

            {/* Investment Portfolio Summary */}
            <section className="dashboard-stats-grid investment-stats-grid">
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon savings-icon">
                            <FiBriefcase />
                        </div>
                        <span className="dashboard-stat-label">Total Invested</span>
                    </div>
                    <h2>{formatCurrency(investmentPortfolio.invested)}</h2>
                    <p>{investments.length} investment holdings</p>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className="dashboard-stat-icon income-icon">
                            <FiTrendingUp />
                        </div>
                        <span className="dashboard-stat-label">Current Portfolio Value</span>
                    </div>
                    <h2>{formatCurrency(investmentPortfolio.current)}</h2>
                    <p>Current value of your holdings</p>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-top">
                        <div className={`dashboard-stat-icon ${
                            investmentPortfolio.profit >= 0 ? "income-icon" : "expense-icon"
                        }`}>
                            {investmentPortfolio.profit >= 0
                                ? <FiArrowUpRight />
                                : <FiArrowDownRight />}
                        </div>
                        <span className="dashboard-stat-label">Investment Profit / Loss</span>
                    </div>
                    <h2 className={
                        investmentPortfolio.profit >= 0
                            ? "transaction-income"
                            : "transaction-expense"
                    }>
                        {formatCurrency(investmentPortfolio.profit)}
                    </h2>
                    <p>
                        {investmentPortfolio.returns.toFixed(2)}% overall return
                    </p>
                </div>
            </section>

            {/* Monthly Chart and Budget */}
            <section className="dashboard-main-grid">
                <div className="dashboard-panel dashboard-chart-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Income vs Expenses</h2>
                            <p>Monthly financial activity over six months</p>
                        </div>
                        <span className="dashboard-panel-icon">
                            <FiActivity />
                        </span>
                    </div>

                    <div className="dashboard-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22a879" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22a879" stopOpacity={0} />
                                    </linearGradient>

                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e66b75" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#e66b75" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border-color)"
                                />

                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    tickFormatter={formatShortCurrency}
                                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={55}
                                />

                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "10px",
                                        color: "var(--text-primary)"
                                    }}
                                />

                                <Legend />

                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#22a879"
                                    fill="url(#incomeGradient)"
                                    strokeWidth={3}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#e66b75"
                                    fill="url(#expenseGradient)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-panel dashboard-budget-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Monthly Budget</h2>
                            <p>Current month's spending</p>
                        </div>
                        <span className="dashboard-panel-icon">
                            <FiTarget />
                        </span>
                    </div>

                    <div className="dashboard-budget-total">
                        <strong>{formatCurrency(monthlyBudgetLimit)}</strong>
                        <span>Budget limit</span>
                    </div>

                    <div className="dashboard-budget-progress">
                        <div
                            className="dashboard-budget-progress-fill"
                            style={{ width: `${budgetPercentage}%` }}
                        />
                    </div>

                    <div className="dashboard-budget-numbers">
                        <span>{formatCurrency(monthlyBudgetSpent)} spent</span>
                        <strong>{Math.round(budgetPercentage)}%</strong>
                    </div>

                    <div className="dashboard-budget-details">
                        <div>
                            <span className="budget-dot spent-dot" />
                            <span>Spent this month</span>
                            <strong>{formatCurrency(monthlyBudgetSpent)}</strong>
                        </div>
                        <div>
                            <span className="budget-dot remaining-dot" />
                            <span>Remaining</span>
                            <strong>
                                {formatCurrency(
                                    Math.max(monthlyBudgetLimit - monthlyBudgetSpent, 0)
                                )}
                            </strong>
                        </div>
                    </div>

                    {monthlyBudgetLimit === 0 && (
                        <p className="dashboard-no-budget">
                            No budget found for this month. Create one in Budgets.
                        </p>
                    )}
                </div>
            </section>

            {/* Expense Categories and This Month */}
            <section className="dashboard-secondary-grid">
                <div className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Expense Categories</h2>
                            <p>Where your money is going</p>
                        </div>
                    </div>

                    {categoryData.length === 0 ? (
                        <div className="dashboard-empty-chart">
                            No expense records available.
                        </div>
                    ) : (
                        <div className="dashboard-pie-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                    >
                                        {categoryData.map((item, index) => (
                                            <Cell
                                                key={item.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>This Month</h2>
                            <p>Your current monthly totals</p>
                        </div>
                    </div>

                    <div className="dashboard-monthly-item">
                        <div className="monthly-item-icon income-icon">
                            <FiTrendingUp />
                        </div>
                        <div>
                            <span>Income</span>
                            <strong>{formatCurrency(currentMonthIncome)}</strong>
                        </div>
                    </div>

                    <div className="dashboard-monthly-item">
                        <div className="monthly-item-icon expense-icon">
                            <FiTrendingDown />
                        </div>
                        <div>
                            <span>Expenses</span>
                            <strong>{formatCurrency(currentMonthExpenses)}</strong>
                        </div>
                    </div>

                    <div className="dashboard-monthly-item">
                        <div className="monthly-item-icon savings-icon">
                            <FiDollarSign />
                        </div>
                        <div>
                            <span>Monthly difference</span>
                            <strong>
                                {formatCurrency(currentMonthIncome - currentMonthExpenses)}
                            </strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Investment Distribution and Holdings */}
            <section className="dashboard-secondary-grid">
                <div className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Investment Distribution</h2>
                            <p>Portfolio value by investment type</p>
                        </div>
                        <FiBriefcase />
                    </div>

                    {investmentDistribution.length === 0 ? (
                        <div className="dashboard-empty-chart">
                            No investments available. Add investments to see your portfolio.
                        </div>
                    ) : (
                        <div className="dashboard-pie-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={investmentDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                    >
                                        {investmentDistribution.map((item, index) => (
                                            <Cell
                                                key={item.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Recent Investments</h2>
                            <p>Your latest portfolio holdings</p>
                        </div>
                        <span className="dashboard-record-count">
                            {investments.length} holdings
                        </span>
                    </div>

                    {recentInvestments.length === 0 ? (
                        <div className="dashboard-empty-chart">
                            No investments added yet.
                        </div>
                    ) : (
                        <div className="dashboard-recent-list">
                            {recentInvestments.map((item) => {
                                const invested =
                                    Number(item.units || 0) *
                                    Number(item.avgBuyPrice || 0);

                                const currentValue =
                                    Number(item.units || 0) *
                                    Number(item.currentPrice || 0);

                                const profit = currentValue - invested;

                                return (
                                    <div
                                        className="dashboard-recent-item"
                                        key={item.id}
                                    >
                                        <div className="dashboard-transaction-icon savings-icon">
                                            <FiBriefcase />
                                        </div>

                                        <div className="dashboard-transaction-info">
                                            <strong>{item.name}</strong>
                                            <span>
                                                {item.symbol || item.type || "Investment"}
                                            </span>
                                        </div>

                                        <strong className={
                                            profit >= 0
                                                ? "transaction-income"
                                                : "transaction-expense"
                                        }>
                                            {formatCurrency(profit)}
                                        </strong>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Transactions */}
            <section className="dashboard-panel dashboard-recent-panel">
                <div className="dashboard-panel-heading">
                    <div>
                        <h2>Recent Transactions</h2>
                        <p>Your latest income and expenses</p>
                    </div>
                    <span className="dashboard-record-count">
                        {transactions.length} records
                    </span>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="dashboard-empty-chart">
                        No transactions yet. Add income or expenses to get started.
                    </div>
                ) : (
                    <div className="dashboard-recent-list">
                        {recentTransactions.map((transaction) => (
                            <div
                                className="dashboard-recent-item"
                                key={`${transaction.type}-${transaction.id}`}
                            >
                                <div
                                    className={`dashboard-transaction-icon ${
                                        transaction.type === "Income"
                                            ? "income-icon"
                                            : "expense-icon"
                                    }`}
                                >
                                    {transaction.type === "Income"
                                        ? <FiArrowDownRight />
                                        : <FiArrowUpRight />}
                                </div>

                                <div className="dashboard-transaction-info">
                                    <strong>{transaction.title}</strong>
                                    <span>
                                        {transaction.category} · {transaction.date}
                                    </span>
                                </div>

                                <strong
                                    className={
                                        transaction.type === "Income"
                                            ? "transaction-income"
                                            : "transaction-expense"
                                    }
                                >
                                    {transaction.type === "Income" ? "+" : "-"}
                                    {formatCurrency(transaction.amount)}
                                </strong>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
