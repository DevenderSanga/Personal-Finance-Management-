
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("finwise-theme") || "light";
    });

    const [direction, setDirection] = useState(() => {
        return localStorage.getItem("finwise-direction") || "ltr";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("finwise-theme", theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.dir = direction;
        localStorage.setItem("finwise-direction", direction);
    }, [direction]);

    const toggleTheme = () => {
        setTheme((current) =>
            current === "light" ? "dark" : "light"
        );
    };

    const toggleDirection = () => {
        setDirection((current) =>
            current === "ltr" ? "rtl" : "ltr"
        );
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                direction,
                setDirection,
                toggleDirection
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}
