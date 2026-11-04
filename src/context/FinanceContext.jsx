
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    initialIncome,
    initialExpenses,
    initialBudgets,
    initialSavingsGoals,
    initialInvestments
} from "../data/initialData";

const FinanceContext = createContext(null);

const loadRecords = (key, initialRecords) => {
    try {
        const savedData = localStorage.getItem(key);

        return savedData
            ? JSON.parse(savedData)
            : initialRecords;
    } catch (error) {
        console.error(`Unable to load ${key}:`, error);
        return initialRecords;
    }
};

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 10);
};

export function FinanceProvider({ children }) {
    const [income, setIncome] = useState(() =>
        loadRecords("finwise_income", initialIncome)
    );

    const [expenses, setExpenses] = useState(() =>
        loadRecords("finwise_expenses", initialExpenses)
    );

    const [budgets, setBudgets] = useState(() =>
        loadRecords("finwise_budgets", initialBudgets)
    );

    const [savingsGoals, setSavingsGoals] = useState(() =>
        loadRecords("finwise_savings_goals", initialSavingsGoals)
    );

    const [investments, setInvestments] = useState(() =>
        loadRecords("finwise_investments", initialInvestments)
    );

    // Separate history of investment purchases, sales, dividends and interest.
    const [investmentTransactions, setInvestmentTransactions] = useState(() =>
        loadRecords("finwise_investment_transactions", [])
    );

    useEffect(() => {
        localStorage.setItem("finwise_income", JSON.stringify(income));
    }, [income]);

    useEffect(() => {
        localStorage.setItem("finwise_expenses", JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem("finwise_budgets", JSON.stringify(budgets));
    }, [budgets]);

    useEffect(() => {
        localStorage.setItem(
            "finwise_savings_goals",
            JSON.stringify(savingsGoals)
        );
    }, [savingsGoals]);

    useEffect(() => {
        localStorage.setItem(
            "finwise_investments",
            JSON.stringify(investments)
        );
    }, [investments]);

    useEffect(() => {
        localStorage.setItem(
            "finwise_investment_transactions",
            JSON.stringify(investmentTransactions)
        );
    }, [investmentTransactions]);

    const getSetter = (type) => {
        const setters = {
            income: setIncome,
            expenses: setExpenses,
            budgets: setBudgets,
            savingsGoals: setSavingsGoals,
            investments: setInvestments
        };

        return setters[type];
    };

    // Add a new investment activity to the transaction history.
    const addInvestmentActivity = (activity) => {
        const amount = Number(activity.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const activityType = activity.activityType || "Buy";

        const inflowTypes = ["Sell", "Dividend", "Interest"];
        const flow = inflowTypes.includes(activityType)
            ? "inflow"
            : "outflow";

        const newActivity = {
            id: `investment-transaction-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 7)}`,
            title:
                activity.title ||
                `${activityType} - ${activity.name || "Investment"}`,
            category: activity.category || "Investment",
            date: activity.date || getToday(),
            type: "Investment",
            activityType,
            amount,
            flow
        };

        setInvestmentTransactions((previous) => [
            newActivity,
            ...previous
        ]);
    };

    const addRecord = (type, record) => {
        const setter = getSetter(type);

        if (!setter) return;

        const newRecord = {
            ...record,
            id: `${type}-${Date.now()}`
        };

        setter((previous) => [newRecord, ...previous]);

        // A newly added investment holding creates a Buy transaction.
        if (type === "investments") {
            const units = Number(record.units || 0);
            const buyPrice = Number(record.avgBuyPrice || 0);
            const purchaseAmount = units * buyPrice;

            if (purchaseAmount > 0) {
                addInvestmentActivity({
                    activityType: "Buy",
                    title: `Bought ${record.name || "Investment"}`,
                    category: record.type || "Investment",
                    date: record.date || getToday(),
                    amount: purchaseAmount
                });
            }
        }
    };

    const updateRecord = (type, updatedRecord) => {
        const setter = getSetter(type);

        if (!setter) return;

        setter((previous) =>
            previous.map((record) =>
                record.id === updatedRecord.id
                    ? updatedRecord
                    : record
            )
        );
    };

    const deleteRecord = (type, id) => {
        const setter = getSetter(type);

        if (!setter) return;

        setter((previous) =>
            previous.filter((record) => record.id !== id)
        );
    };

    const addContribution = (goalId, amount) => {
        const contribution = Number(amount);

        if (!Number.isFinite(contribution) || contribution <= 0) {
            return;
        }

        setSavingsGoals((previous) =>
            previous.map((goal) =>
                goal.id === goalId
                    ? {
                        ...goal,
                        savedAmount:
                            Number(goal.savedAmount) + contribution
                    }
                    : goal
            )
        );
    };

    const transactions = [
        ...income.map((record) => ({
            ...record,
            type: "Income"
        })),

        ...expenses.map((record) => ({
            ...record,
            type: "Expense"
        })),

        ...investmentTransactions
    ].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    const totalIncome = income.reduce(
        (total, record) => total + Number(record.amount || 0),
        0
    );

    const totalExpenses = expenses.reduce(
        (total, record) => total + Number(record.amount || 0),
        0
    );

    const balance = totalIncome - totalExpenses;

    const value = {
        income,
        expenses,
        budgets,
        savingsGoals,
        investments,
        investmentTransactions,
        transactions,
        totalIncome,
        totalExpenses,
        balance,
        addRecord,
        updateRecord,
        deleteRecord,
        addContribution,
        addInvestmentActivity
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);

    if (!context) {
        throw new Error(
            "useFinance must be used inside FinanceProvider"
        );
    }

    return context;
}
