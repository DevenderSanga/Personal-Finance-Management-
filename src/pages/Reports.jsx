
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
    FiDownload,
    FiFileText,
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiBriefcase,
} from "react-icons/fi";

import { useFinance } from "../context/FinanceContext";

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

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

function Reports() {
    const {
        income,
        expenses,
        budgets,
        savingsGoals,
        investments = [],
        transactions = [],
    } = useFinance();

    const now = new Date();

    const [reportType, setReportType] = useState("monthly");

    const [selectedMonth, setSelectedMonth] = useState(
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`
    );

    const [selectedYear, setSelectedYear] = useState(
        String(now.getFullYear())
    );

    const years = Array.from(
        new Set([
            String(now.getFullYear()),
            ...transactions.map((item) => item.date?.slice(0, 4)),
            ...investments.map((item) => item.date?.slice(0, 4)),
        ])
    )
        .filter(Boolean)
        .sort((a, b) => Number(b) - Number(a));

    const isInSelectedPeriod = (date) => {
        if (!date) return false;

        return reportType === "monthly"
            ? date.startsWith(selectedMonth)
            : date.startsWith(selectedYear);
    };

    const filteredIncome = useMemo(() => {
        return income.filter((item) =>
            isInSelectedPeriod(item.date)
        );
    }, [income, reportType, selectedMonth, selectedYear]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter((item) =>
            isInSelectedPeriod(item.date)
        );
    }, [expenses, reportType, selectedMonth, selectedYear]);

    // Investment activities in the selected report period
    const filteredInvestmentTransactions = useMemo(() => {
        return transactions.filter(
            (item) =>
                item.type === "Investment" &&
                isInSelectedPeriod(item.date)
        );
    }, [transactions, reportType, selectedMonth, selectedYear]);

    // All transaction types for the selected period
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter((item) => isInSelectedPeriod(item.date))
            .sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
    }, [transactions, reportType, selectedMonth, selectedYear]);

    const totalIncome = filteredIncome.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const totalExpenses = filteredExpenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const netSavings = totalIncome - totalExpenses;

    const savingsRate =
        totalIncome > 0
            ? (netSavings / totalIncome) * 100
            : 0;

    const totalGoalSavings = savingsGoals.reduce(
        (sum, goal) => sum + Number(goal.savedAmount || 0),
        0
    );

    // Current portfolio summary
    const portfolio = useMemo(() => {
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

    // Investment activity totals for the selected period
    const investmentActivityTotals = useMemo(() => {
        return filteredInvestmentTransactions.reduce(
            (totals, item) => {
                const amount = Number(item.amount || 0);

                if (item.activityType === "Buy") {
                    totals.purchases += amount;
                } else if (
                    ["Sell", "Dividend", "Interest"].includes(
                        item.activityType
                    )
                ) {
                    totals.receipts += amount;
                }

                return totals;
            },
            {
                purchases: 0,
                receipts: 0,
            }
        );
    }, [filteredInvestmentTransactions]);

    // Expense category report
    const categoryData = useMemo(() => {
        const totals = {};

        filteredExpenses.forEach((item) => {
            const category = item.category || "Other";

            totals[category] =
                (totals[category] || 0) +
                Number(item.amount || 0);
        });

        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    // Monthly chart data
    const monthlyChartData = useMemo(() => {
        const result = [];

        const monthsToShow =
            reportType === "monthly" ? 6 : 12;

        for (let i = monthsToShow - 1; i >= 0; i--) {
            let date;

            if (reportType === "monthly") {
                const [year, month] = selectedMonth
                    .split("-")
                    .map(Number);

                date = new Date(year, month - 1 - i, 1);
            } else {
                date = new Date(
                    Number(selectedYear),
                    11 - i,
                    1
                );
            }

            const key =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;

            const monthIncome = income
                .filter((item) => item.date?.startsWith(key))
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount || 0),
                    0
                );

            const monthExpenses = expenses
                .filter((item) => item.date?.startsWith(key))
                .reduce(
                    (sum, item) =>
                        sum + Number(item.amount || 0),
                    0
                );

            result.push({
                month: date.toLocaleDateString("en-IN", {
                    month: "short",
                }),
                income: monthIncome,
                expenses: monthExpenses,
            });
        }

        return result;
    }, [income, expenses, reportType, selectedMonth, selectedYear]);

    // Budget report
    const reportBudgets = budgets.filter((item) =>
        reportType === "monthly"
            ? item.month === selectedMonth
            : item.month?.startsWith(selectedYear)
    );

    const budgetDetails = reportBudgets.map((budget) => {
        const spent = filteredExpenses
            .filter(
                (expense) =>
                    expense.category === budget.category
            )
            .reduce(
                (sum, expense) =>
                    sum + Number(expense.amount || 0),
                0
            );

        const limit = Number(budget.amount || 0);

        return {
            ...budget,
            spent,
            remaining: limit - spent,
            percentage:
                limit > 0 ? (spent / limit) * 100 : 0,
        };
    });

    // CSV Export
    const exportCSV = () => {
        const rows = [
            ["FinWise Financial Report"],
            ["Report Type", reportType],
            [
                "Report Period",
                reportType === "monthly"
                    ? selectedMonth
                    : selectedYear,
            ],

            [],
            ["Income and Expense Summary"],
            ["Total Income", totalIncome],
            ["Total Expenses", totalExpenses],
            ["Net Savings", netSavings],
            ["Savings Rate", `${savingsRate.toFixed(1)}%`],

            [],
            ["Investment Portfolio Summary"],
            ["Total Invested", portfolio.invested],
            ["Current Portfolio Value", portfolio.currentValue],
            ["Unrealised Profit/Loss", portfolio.profitLoss],
            [
                "Portfolio Return",
                `${portfolio.returnPercentage.toFixed(2)}%`,
            ],

            [],
            ["Investment Activity for Selected Period"],
            ["Investment Purchases", investmentActivityTotals.purchases],
            ["Investment Receipts", investmentActivityTotals.receipts],

            [],
            ["Investment Holdings"],
            [
                "Investment",
                "Category",
                "Units",
                "Average Buy Price",
                "Current Price",
                "Invested Amount",
                "Current Value",
                "Profit/Loss",
            ],

            ...investments.map((item) => {
                const invested =
                    Number(item.units || 0) *
                    Number(item.avgBuyPrice || 0);

                const currentValue =
                    Number(item.units || 0) *
                    Number(item.currentPrice || 0);

                return [
                    item.name || "",
                    item.type || "Other",
                    Number(item.units || 0),
                    Number(item.avgBuyPrice || 0),
                    Number(item.currentPrice || 0),
                    invested,
                    currentValue,
                    currentValue - invested,
                ];
            }),

            [],
            ["Transactions for Selected Period"],
            [
                "Date",
                "Title",
                "Category",
                "Type",
                "Activity",
                "Amount",
                "Cash Flow",
            ],

            ...filteredTransactions.map((item) => {
                const flow =
                    item.type === "Income"
                        ? "Inflow"
                        : item.type === "Expense"
                            ? "Outflow"
                            : item.flow === "inflow"
                                ? "Inflow"
                                : "Outflow";

                return [
                    item.date || "",
                    item.title || item.source || item.description || "",
                    item.category || "Other",
                    item.type || "",
                    item.activityType || "",
                    Number(item.amount || 0),
                    flow,
                ];
            }),
        ];

        const csvContent = rows
            .map((row) =>
                row.map((value) => {
                    const text = String(value ?? "");
                    return `"${text.replace(/"/g, '""')}"`;
                }).join(",")
            )
            .join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `FinWise-Report-${reportType === "monthly"
                ? selectedMonth
                : selectedYear
            }.csv`;

        link.click();
        URL.revokeObjectURL(url);
    };

    const reportLabel =
        reportType === "monthly"
            ? new Date(
                Number(selectedMonth.slice(0, 4)),
                Number(selectedMonth.slice(5, 7)) - 1
            ).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
            })
            : selectedYear;

    return (
        <div className="reports-page">

            {/* Header */}
            <div className="reports-heading">
                <div>
                    <h1>Financial Reports</h1>
                    <p>
                        Review your financial performance and download reports.
                    </p>
                </div>

                <button
                    className="reports-export-button"
                    onClick={exportCSV}
                >
                    <FiDownload />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="reports-filter-card">
                <div className="reports-filter-group">
                    <label>Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="monthly">Monthly Report</option>
                        <option value="yearly">Yearly Report</option>
                    </select>
                </div>

                {reportType === "monthly" ? (
                    <div className="reports-filter-group">
                        <label>Select Month</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(e.target.value)
                            }
                        />
                    </div>
                ) : (
                    <div className="reports-filter-group">
                        <label>Select Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(e.target.value)
                            }
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="reports-period-label">
                    <FiFileText />
                    <span>{reportLabel} Report</span>
                </div>
            </div>

            {/* Income and expense summary */}
            <div className="reports-summary-grid">

                <div className="reports-summary-card">
                    <div className="reports-summary-icon income">
                        <FiTrendingUp />
                    </div>
                    <span>Total Income</span>
                    <h2>{currency(totalIncome)}</h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon expense">
                        <FiTrendingDown />
                    </div>
                    <span>Total Expenses</span>
                    <h2>{currency(totalExpenses)}</h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon savings">
                        <FiDollarSign />
                    </div>
                    <span>Net Savings</span>
                    <h2>{currency(netSavings)}</h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon rate">
                        <FiFileText />
                    </div>
                    <span>Savings Rate</span>
                    <h2>{savingsRate.toFixed(1)}%</h2>
                </div>

            </div>

            {/* Investment portfolio summary */}
            <div className="reports-section-title">
                <div>
                    <h2>Investment Portfolio Report</h2>
                    <p>
                        Current portfolio position, separate from the selected
                        income and expense period.
                    </p>
                </div>
            </div>

            <div className="reports-summary-grid">

                <div className="reports-summary-card">
                    <div className="reports-summary-icon investment">
                        <FiBriefcase />
                    </div>
                    <span>Total Invested</span>
                    <h2>{currency(portfolio.invested)}</h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon investment">
                        <FiDollarSign />
                    </div>
                    <span>Current Portfolio Value</span>
                    <h2>{currency(portfolio.currentValue)}</h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon investment">
                        {portfolio.profitLoss >= 0
                            ? <FiTrendingUp />
                            : <FiTrendingDown />}
                    </div>
                    <span>Unrealised Profit / Loss</span>
                    <h2 className={
                        portfolio.profitLoss >= 0
                            ? "investment-positive"
                            : "investment-negative"
                    }>
                        {portfolio.profitLoss >= 0 ? "+" : ""}
                        {currency(portfolio.profitLoss)}
                    </h2>
                </div>

                <div className="reports-summary-card">
                    <div className="reports-summary-icon investment">
                        <FiActivityIcon />
                    </div>
                    <span>Portfolio Return</span>
                    <h2 className={
                        portfolio.returnPercentage >= 0
                            ? "investment-positive"
                            : "investment-negative"
                    }>
                        {portfolio.returnPercentage >= 0 ? "+" : ""}
                        {portfolio.returnPercentage.toFixed(2)}%
                    </h2>
                </div>

            </div>

            {/* Investment allocation and activity */}
            <div className="reports-panel reports-allocation-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h3>Investment Allocation</h3>
                        <p>Current portfolio value by investment type</p>
                    </div>
                </div>

                {investmentAllocation.length > 0 ? (
                    <div className="reports-allocation-content">
                        <div className="reports-pie-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={investmentAllocation}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={3}
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

                        <div className="reports-category-list">
                            {investmentAllocation.map((item, index) => (
                                <div
                                    className="reports-category-row"
                                    key={item.name}
                                >
                                    <span>
                                        <i
                                            style={{
                                                background: COLORS[index % COLORS.length],
                                            }}
                                        />
                                        {item.name}
                                    </span>

                                    <strong>{currency(item.value)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="reports-empty">
                        No investment allocation available.
                    </div>
                )}
            </div>

            {/* Holdings table */}
            <div className="reports-panel reports-transactions-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h3>Investment Holdings Breakdown</h3>
                        <p>
                            Current details of all your investment holdings.
                        </p>
                    </div>
                </div>

                {investments.length > 0 ? (
                    <div className="reports-table-wrapper">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Investment</th>
                                    <th>Type</th>
                                    <th>Units</th>
                                    <th>Invested</th>
                                    <th>Current Value</th>
                                    <th>Profit / Loss</th>
                                </tr>
                            </thead>

                            <tbody>
                                {investments.map((item) => {
                                    const invested =
                                        Number(item.units || 0) *
                                        Number(item.avgBuyPrice || 0);

                                    const currentValue =
                                        Number(item.units || 0) *
                                        Number(item.currentPrice || 0);

                                    const profitLoss =
                                        currentValue - invested;

                                    return (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.type || "Other"}</td>
                                            <td>{item.units}</td>
                                            <td>{currency(invested)}</td>
                                            <td>{currency(currentValue)}</td>
                                            <td className={
                                                profitLoss >= 0
                                                    ? "investment-positive"
                                                    : "investment-negative"
                                            }>
                                                {profitLoss >= 0 ? "+" : ""}
                                                {currency(profitLoss)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="reports-empty">
                        No investment holdings available.
                    </div>
                )}
            </div>

            {/* Income and expense charts */}
            <div className="reports-charts-grid">

                <div className="reports-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <h3>Income & Expenses</h3>
                            <p>
                                {reportType === "monthly"
                                    ? "Six-month comparison ending in selected month"
                                    : "Monthly comparison for selected year"}
                            </p>
                        </div>
                    </div>

                    <div className="reports-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData}>
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

                <div className="reports-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <h3>Expense Categories</h3>
                            <p>Category-wise report for {reportLabel}</p>
                        </div>
                    </div>

                    {categoryData.length > 0 ? (
                        <>
                            <div className="reports-pie-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={55}
                                            outerRadius={90}
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

                            <div className="reports-category-list">
                                {categoryData.map((item, index) => (
                                    <div
                                        className="reports-category-row"
                                        key={item.name}
                                    >
                                        <span>
                                            <i
                                                style={{
                                                    background:
                                                        COLORS[index % COLORS.length],
                                                }}
                                            />
                                            {item.name}
                                        </span>
                                        <strong>{currency(item.value)}</strong>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="reports-empty">
                            No expenses found for this period.
                        </div>
                    )}
                </div>

            </div>

            {/* Budget performance */}
            <div className="reports-panel reports-budget-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h3>Budget Performance</h3>
                        <p>Budget usage for {reportLabel}</p>
                    </div>
                </div>

                {budgetDetails.length > 0 ? (
                    <div className="reports-budget-list">
                        {budgetDetails.map((budget) => (
                            <div
                                className="reports-budget-row"
                                key={budget.id}
                            >
                                <div className="reports-budget-info">
                                    <strong>{budget.category}</strong>
                                    <span>
                                        {currency(budget.spent)} of{" "}
                                        {currency(budget.amount)}
                                    </span>
                                </div>

                                <div className="reports-budget-track">
                                    <div
                                        className={`reports-budget-fill ${budget.percentage > 100
                                                ? "over"
                                                : ""
                                            }`}
                                        style={{
                                            width: `${Math.min(
                                                budget.percentage,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>

                                <div className="reports-budget-footer">
                                    <span>
                                        {budget.percentage.toFixed(1)}% used
                                    </span>
                                    <strong>
                                        {budget.remaining >= 0
                                            ? `${currency(budget.remaining)} left`
                                            : `${currency(Math.abs(budget.remaining))} over`}
                                    </strong>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="reports-empty">
                        No budgets found for this period.
                    </div>
                )}
            </div>

            {/* Savings goals */}
            <div className="reports-panel reports-goals-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h3>Savings Goals Overview</h3>
                        <p>Your current savings goal progress</p>
                    </div>
                    <strong>{currency(totalGoalSavings)} saved</strong>
                </div>

                {savingsGoals.length > 0 ? (
                    <div className="reports-goals-grid">
                        {savingsGoals.map((goal) => {
                            const saved = Number(goal.savedAmount || 0);
                            const target = Number(goal.targetAmount || 0);

                            const percentage =
                                target > 0
                                    ? (saved / target) * 100
                                    : 0;

                            return (
                                <div
                                    className="reports-goal-card"
                                    key={goal.id}
                                >
                                    <div className="reports-goal-top">
                                        <strong>{goal.name}</strong>
                                        <span>{percentage.toFixed(0)}%</span>
                                    </div>

                                    <div className="reports-goal-track">
                                        <div
                                            style={{
                                                width: `${Math.min(
                                                    percentage,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="reports-goal-amounts">
                                        <span>{currency(saved)}</span>
                                        <span>{currency(target)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="reports-empty">
                        No savings goals available.
                    </div>
                )}
            </div>

            {/* Transactions */}
            <div className="reports-panel reports-transactions-panel">
                <div className="reports-panel-heading">
                    <div>
                        <h3>Transaction Summary</h3>
                        <p>
                            {filteredTransactions.length} records in this report
                        </p>
                    </div>
                </div>

                {filteredTransactions.length > 0 ? (
                    <div className="reports-table-wrapper">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((item) => {
                                    const isIncome = item.type === "Income";
                                    const isInvestment = item.type === "Investment";

                                    const isInflow =
                                        isIncome ||
                                        (isInvestment && item.flow === "inflow");

                                    return (
                                        <tr key={`${item.type}-${item.id}`}>
                                            <td>{item.date}</td>

                                            <td>
                                                {item.title ||
                                                    item.source ||
                                                    item.description ||
                                                    "Transaction"}
                                            </td>

                                            <td>{item.category || "Other"}</td>

                                            <td>
                                                <span
                                                    className={`reports-type ${isInvestment
                                                            ? "investment"
                                                            : isIncome
                                                                ? "income"
                                                                : "expense"
                                                        }`}
                                                >
                                                    {isInvestment
                                                        ? `Investment - ${item.activityType || "Activity"}`
                                                        : item.type}
                                                </span>
                                            </td>

                                            <td className={
                                                isInvestment
                                                    ? isInflow
                                                        ? "investment-positive"
                                                        : "investment-negative"
                                                    : isIncome
                                                        ? "reports-income-amount"
                                                        : "reports-expense-amount"
                                            }>
                                                {isInflow ? "+" : "-"}
                                                {currency(item.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="reports-empty">
                        No transactions found for this period.
                    </div>
                )}
            </div>

        </div>
    );
}

function FiActivityIcon() {
    return <FiTrendingUp />;
}

export default Reports;
