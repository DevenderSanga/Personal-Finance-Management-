
import { useMemo, useState } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiActivity,
    FiCalendar,
    FiBriefcase,
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const COLORS = [
    "#6366f1",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#ec4899",
    "#8b5cf6",
    "#f97316",
    "#64748b",
];

function Analytics() {
    const {
        income,
        expenses,
        budgets,
        investments = [],
    } = useFinance();

    const [period, setPeriod] = useState("6");

    const today = new Date();

    const currentMonth =
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`;

    const currentMonthIncome = useMemo(() => {
        return income
            .filter((item) => item.date?.startsWith(currentMonth))
            .reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );
    }, [income, currentMonth]);

    const currentMonthExpenses = useMemo(() => {
        return expenses
            .filter((item) => item.date?.startsWith(currentMonth))
            .reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );
    }, [expenses, currentMonth]);

    const totalIncome = income.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const totalExpenses = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const balance = totalIncome - totalExpenses;

    const savingsRate =
        currentMonthIncome > 0
            ? ((currentMonthIncome - currentMonthExpenses) /
                currentMonthIncome) * 100
            : 0;

    // Investment portfolio calculations
    const investmentPortfolio = useMemo(() => {
        const invested = investments.reduce(
            (sum, item) =>
                sum +
                Number(item.units || 0) *
                Number(item.avgBuyPrice || 0),
            0
        );

        const currentValue = investments.reduce(
            (sum, item) =>
                sum +
                Number(item.units || 0) *
                Number(item.currentPrice || 0),
            0
        );

        const profitLoss = currentValue - invested;

        const returnPercentage =
            invested > 0
                ? (profitLoss / invested) * 100
                : 0;

        return {
            invested,
            currentValue,
            profitLoss,
            returnPercentage,
        };
    }, [investments]);

    // Investment allocation by type
    const investmentAllocation = useMemo(() => {
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

    // Monthly income and expense chart
    const monthlyData = useMemo(() => {
        const months = [];

        for (let i = Number(period) - 1; i >= 0; i--) {
            const date = new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );

            const monthKey =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;

            months.push({
                month: date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "2-digit",
                }),

                income: income
                    .filter((item) => item.date?.startsWith(monthKey))
                    .reduce(
                        (sum, item) =>
                            sum + Number(item.amount || 0),
                        0
                    ),

                expenses: expenses
                    .filter((item) => item.date?.startsWith(monthKey))
                    .reduce(
                        (sum, item) =>
                            sum + Number(item.amount || 0),
                        0
                    ),
            });
        }

        return months;
    }, [income, expenses, period]);

    // Expense category breakdown
    const categoryData = useMemo(() => {
        const categoryTotals = {};

        expenses
            .filter((item) => item.date?.startsWith(currentMonth))
            .forEach((item) => {
                const category = item.category || "Other";

                categoryTotals[category] =
                    (categoryTotals[category] || 0) +
                    Number(item.amount || 0);
            });

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses, currentMonth]);

    // Current month budget usage
    const currentBudgets = budgets.filter(
        (item) => item.month === currentMonth
    );

    const totalBudget = currentBudgets.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const budgetUsage =
        totalBudget > 0
            ? (currentMonthExpenses / totalBudget) * 100
            : 0;

    const topCategory = categoryData[0];

    const averageExpense =
        expenses.length > 0
            ? totalExpenses / expenses.length
            : 0;

    return (
        <div className="analytics-page">

            <div className="analytics-heading">
                <div>
                    <h1>Financial Analytics</h1>
                    <p>
                        Understand your financial performance and spending habits.
                    </p>
                </div>

                <div className="analytics-period">
                    <FiCalendar />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="3">Last 3 Months</option>
                        <option value="6">Last 6 Months</option>
                        <option value="12">Last 12 Months</option>
                    </select>
                </div>
            </div>

            {/* Income and expense summary */}
            <div className="analytics-stats">

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Total Income</span>
                        <div className="analytics-icon income-icon">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <h2>{currency(currentMonthIncome)}</h2>
                    <p>Income this month</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Total Expenses</span>
                        <div className="analytics-icon expense-icon">
                            <FiTrendingDown />
                        </div>
                    </div>
                    <h2>{currency(currentMonthExpenses)}</h2>
                    <p>Expenses this month</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Overall Balance</span>
                        <div className="analytics-icon balance-icon">
                            <FiDollarSign />
                        </div>
                    </div>
                    <h2>{currency(balance)}</h2>
                    <p>All recorded income minus expenses</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Savings Rate</span>
                        <div className="analytics-icon savings-icon">
                            <FiActivity />
                        </div>
                    </div>
                    <h2>{savingsRate.toFixed(1)}%</h2>
                    <p>Based on this month's income</p>
                </div>

            </div>

            {/* Investment summary */}
            <div className="analytics-section-title">
                <div>
                    <h2>Investment Analytics</h2>
                    <p>Your current investment portfolio performance.</p>
                </div>
            </div>

            <div className="analytics-stats investment-analytics-stats">

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Total Invested</span>
                        <div className="analytics-icon balance-icon">
                            <FiBriefcase />
                        </div>
                    </div>
                    <h2>{currency(investmentPortfolio.invested)}</h2>
                    <p>Purchase value of holdings</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Current Portfolio Value</span>
                        <div className="analytics-icon income-icon">
                            <FiDollarSign />
                        </div>
                    </div>
                    <h2>{currency(investmentPortfolio.currentValue)}</h2>
                    <p>Based on current prices entered</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Profit / Loss</span>
                        <div className={`analytics-icon ${investmentPortfolio.profitLoss >= 0
                                ? "income-icon"
                                : "expense-icon"
                            }`}>
                            {investmentPortfolio.profitLoss >= 0
                                ? <FiTrendingUp />
                                : <FiTrendingDown />}
                        </div>
                    </div>
                    <h2 className={
                        investmentPortfolio.profitLoss >= 0
                            ? "investment-positive"
                            : "investment-negative"
                    }>
                        {investmentPortfolio.profitLoss >= 0 ? "+" : ""}
                        {currency(investmentPortfolio.profitLoss)}
                    </h2>
                    <p>Unrealised portfolio gain/loss</p>
                </div>

                <div className="analytics-stat-card">
                    <div className="analytics-stat-top">
                        <span>Overall Return</span>
                        <div className="analytics-icon savings-icon">
                            <FiActivity />
                        </div>
                    </div>
                    <h2 className={
                        investmentPortfolio.returnPercentage >= 0
                            ? "investment-positive"
                            : "investment-negative"
                    }>
                        {investmentPortfolio.returnPercentage >= 0 ? "+" : ""}
                        {investmentPortfolio.returnPercentage.toFixed(2)}%
                    </h2>
                    <p>Portfolio return percentage</p>
                </div>

            </div>

            {/* Monthly comparison */}
            <div className="analytics-panel analytics-monthly-panel">
                <div className="analytics-panel-heading">
                    <div>
                        <h3>Income vs Expenses</h3>
                        <p>Monthly financial comparison</p>
                    </div>
                </div>

                <div className="analytics-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyData}
                            margin={{
                                top: 15,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis dataKey="month" />
                            <YAxis
                                tickFormatter={(value) =>
                                    `₹${value / 1000}k`
                                }
                            />
                            <Tooltip
                                formatter={(value) => currency(value)}
                            />
                            <Legend />
                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#10b981"
                                radius={[5, 5, 0, 0]}
                            />
                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="#f97316"
                                radius={[5, 5, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Investment allocation and holdings */}
            <div className="analytics-bottom-grid analytics-investment-grid">

                {/* Investment Allocation */}
                <div className="analytics-panel analytics-allocation-panel">

                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Investment Allocation</h3>
                            <p>How your portfolio is distributed</p>
                        </div>
                    </div>

                    {investmentAllocation.length > 0 ? (
                        <div className="analytics-allocation-layout">

                            <div className="analytics-donut-wrapper">
                                <div className="analytics-allocation-chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={investmentAllocation}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={72}
                                                outerRadius={105}
                                                paddingAngle={4}
                                                stroke="none"
                                            >
                                                {investmentAllocation.map((item, index) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value) => currency(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="analytics-donut-center">
                                    <span>Portfolio Value</span>
                                    <strong>
                                        {currency(investmentPortfolio.currentValue)}
                                    </strong>
                                    <small>{investmentAllocation.length} Categories</small>
                                </div>
                            </div>

                            <div className="analytics-allocation-details">

                                {investmentAllocation.map((item, index) => {
                                    const percentage =
                                        investmentPortfolio.currentValue > 0
                                            ? (item.value /
                                                investmentPortfolio.currentValue) * 100
                                            : 0;

                                    return (
                                        <div
                                            className="analytics-allocation-item"
                                            key={item.name}
                                        >
                                            <div className="analytics-allocation-item-top">

                                                <div className="analytics-allocation-label">
                                                    <span
                                                        className="analytics-allocation-dot"
                                                        style={{
                                                            backgroundColor:
                                                                COLORS[index % COLORS.length],
                                                        }}
                                                    />

                                                    <strong>{item.name}</strong>
                                                </div>

                                                <strong className="analytics-allocation-amount">
                                                    {currency(item.value)}
                                                </strong>

                                            </div>

                                            <div className="analytics-allocation-progress">
                                                <div
                                                    className="analytics-allocation-progress-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor:
                                                            COLORS[index % COLORS.length],
                                                    }}
                                                />
                                            </div>

                                            <div className="analytics-allocation-percentage">
                                                <span>Portfolio share</span>
                                                <strong>{percentage.toFixed(1)}%</strong>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    ) : (
                        <div className="analytics-empty">
                            No investment records available yet.
                        </div>
                    )}
                </div>

                {/* Investment Holdings */}
                <div className="analytics-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Investment Holdings</h3>
                            <p>Current value and profit/loss by investment</p>
                        </div>
                    </div>

                    {investments.length > 0 ? (
                        <div className="analytics-investment-list">
                            {investments.map((item) => {
                                const invested =
                                    Number(item.units || 0) *
                                    Number(item.avgBuyPrice || 0);

                                const currentValue =
                                    Number(item.units || 0) *
                                    Number(item.currentPrice || 0);

                                const profitLoss = currentValue - invested;

                                return (
                                    <div
                                        className="analytics-investment-item"
                                        key={item.id}
                                    >
                                        <div>
                                            <strong>{item.name}</strong>
                                            <span>
                                                {item.type || "Investment"} · {item.units || 0} units
                                            </span>
                                        </div>

                                        <div className="analytics-investment-values">
                                            <strong>{currency(currentValue)}</strong>

                                            <span className={
                                                profitLoss >= 0
                                                    ? "investment-positive"
                                                    : "investment-negative"
                                            }>
                                                {profitLoss >= 0 ? "+" : ""}
                                                {currency(profitLoss)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="analytics-empty">
                            Add investments to view portfolio performance.
                        </div>
                    )}
                </div>

            </div>


            {/* Expense category and budget */}
            <div className="analytics-bottom-grid">

                <div className="analytics-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Expense Breakdown</h3>
                            <p>Spending by category this month</p>
                        </div>
                    </div>

                    {categoryData.length > 0 ? (
                        <>
                            <div className="analytics-pie-chart">
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
                                        <Tooltip
                                            formatter={(value) => currency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="analytics-category-list">
                                {categoryData.map((item, index) => (
                                    <div
                                        className="analytics-category-item"
                                        key={item.name}
                                    >
                                        <div className="analytics-category-name">
                                            <span
                                                className="analytics-color-dot"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[index % COLORS.length],
                                                }}
                                            />
                                            <span>{item.name}</span>
                                        </div>

                                        <strong>{currency(item.value)}</strong>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="analytics-empty">
                            No expenses recorded for this month.
                        </div>
                    )}
                </div>

                <div className="analytics-panel">
                    <div className="analytics-panel-heading">
                        <div>
                            <h3>Budget Performance</h3>
                            <p>Your current month's budget usage</p>
                        </div>
                    </div>

                    <div className="analytics-budget-content">
                        <div className="analytics-budget-total">
                            <div>
                                <span>Total Budget</span>
                                <h2>{currency(totalBudget)}</h2>
                            </div>
                            <div>
                                <span>Total Spent</span>
                                <h2>{currency(currentMonthExpenses)}</h2>
                            </div>
                        </div>

                        {totalBudget > 0 ? (
                            <>
                                <div className="analytics-budget-track">
                                    <div
                                        className={`analytics-budget-fill ${budgetUsage > 100 ? "over-budget" : ""
                                            }`}
                                        style={{
                                            width: `${Math.min(budgetUsage, 100)}%`,
                                        }}
                                    />
                                </div>

                                <div className="analytics-budget-footer">
                                    <span>{budgetUsage.toFixed(1)}% used</span>
                                    <strong>
                                        {currency(
                                            Math.max(
                                                totalBudget - currentMonthExpenses,
                                                0
                                            )
                                        )} remaining
                                    </strong>
                                </div>

                                {budgetUsage > 100 && (
                                    <p className="analytics-warning">
                                        You have exceeded your monthly budget.
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="analytics-empty">
                                No budgets set for this month.
                            </div>
                        )}

                        <div className="analytics-insight-box">
                            <h4>Top Spending Category</h4>
                            {topCategory ? (
                                <>
                                    <h2>{topCategory.name}</h2>
                                    <p>
                                        {currency(topCategory.value)} spent this month.
                                    </p>
                                </>
                            ) : (
                                <p>No spending data available yet.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Financial overview */}
            <div className="analytics-panel analytics-insights">
                <div className="analytics-panel-heading">
                    <div>
                        <h3>Financial Overview</h3>
                        <p>A quick look at your overall financial activity</p>
                    </div>
                </div>

                <div className="analytics-insight-grid">
                    <div className="analytics-insight-item">
                        <span>All-time Income</span>
                        <strong>{currency(totalIncome)}</strong>
                    </div>

                    <div className="analytics-insight-item">
                        <span>All-time Expenses</span>
                        <strong>{currency(totalExpenses)}</strong>
                    </div>

                    <div className="analytics-insight-item">
                        <span>Average Expense Record</span>
                        <strong>{currency(averageExpense)}</strong>
                    </div>

                    <div className="analytics-insight-item">
                        <span>Expense Records</span>
                        <strong>{expenses.length}</strong>
                    </div>

                    <div className="analytics-insight-item">
                        <span>Investment Holdings</span>
                        <strong>{investments.length}</strong>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Analytics;
