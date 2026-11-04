
const SummaryCard = ({ title, amount, change, icon, color, subtitle }) => {
    return (
        <div className="summary-card">
            <div className="summary-top">
                <div>
                    <p className="summary-title">{title}</p>
                    <h2>{amount}</h2>
                </div>

                <div className={`summary-icon ${color}`}>
                    {icon}
                </div>
            </div>

            <div className="summary-bottom">
                <span className="summary-change">{change}</span>
                <span>{subtitle}</span>
            </div>
        </div>
    );
};

export default SummaryCard;
