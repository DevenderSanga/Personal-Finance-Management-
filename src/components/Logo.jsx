function Logo({ className = "", showTagline = false }) {
    return (
        <div className={`finora-logo ${className}`}>
            <svg
                className="finora-logo-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M8 48V34C8 31.8 9.8 30 12 30H17V48H8Z"
                    fill="#20B66A"
                />
                <path
                    d="M22 48V24C22 21.8 23.8 20 26 20H31V48H22Z"
                    fill="#20B66A"
                />
                <path
                    d="M36 48V15C36 12.8 37.8 11 40 11H45V48H36Z"
                    fill="#20B66A"
                />
                <path
                    d="M6 51C19 53 34 47 48 30"
                    stroke="#20B66A"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <path
                    d="M42 29L49 28L48 36"
                    stroke="#20B66A"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="49" cy="13" r="10" fill="#F5B52E" />
                <path
                    d="M49 7V19M52 9.5C51.2 8.5 50.2 8 49 8C47.3 8 46 9 46 10.5C46 12 47.3 12.7 49 13.2C50.7 13.7 52 14.4 52 16C52 17.5 50.7 18.5 49 18.5C47.7 18.5 46.5 18 45.7 17"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>

            <div className="finora-logo-copy">
                <span className="finora-logo-name">Finora</span>
                {showTagline && (
                    <span className="finora-logo-tagline">
                        Plan • Track • Grow
                    </span>
                )}
            </div>
        </div>
    );
}

export default Logo;