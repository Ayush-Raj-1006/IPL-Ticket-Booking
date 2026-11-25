
function MatchCard({ match, onBook }) {
    return (
        <div className="match-card">
            <h3>{match.team1} vs {match.team2}</h3>

            <p>
                <strong>Date:</strong>{" "}
                {new Date(match.match_date).toLocaleString()}
            </p>

            <p><strong>Venue:</strong> {match.venue}</p>

            <p><strong>Ticket Price:</strong> ₹{match.ticket_price}</p>

            <p><strong>Available Seats:</strong> {match.available_seats}</p>

            <button onClick={() => onBook(match)}>
                Book Ticket
            </button>
        </div>
    );
}

export default MatchCard;
