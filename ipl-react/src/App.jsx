
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MatchCard from "./components/MatchCard";
import { supabase } from "./supabase";
import "./App.css";

function App() {
    const [matches, setMatches] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("All");
    const [selectedMatch, setSelectedMatch] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch matches from Supabase
    async function fetchMatches() {
        const { data, error } = await supabase
            .from("matches")
            .select("*")
            .order("match_number", { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setMatches(data || []);
            setError("");
        }

        setLoading(false);
    }

    // Load matches and subscribe to database changes
    useEffect(() => {
        fetchMatches();

        const channel = supabase
            .channel("matches-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "matches"
                },
                () => fetchMatches()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Open booking form for selected match
    function openBooking(match) {
        setSelectedMatch(match);
        setName("");
        setEmail("");
        setQuantity(1);
        setMessage("");
        setError("");

        setTimeout(() => {
            document.getElementById("booking")?.scrollIntoView({
                behavior: "smooth"
            });
        }, 100);
    }

    // Submit booking to Supabase
    async function handleBooking(event) {
        event.preventDefault();

        if (!selectedMatch) return;

        const tickets = Number(quantity);
        const price = Number(selectedMatch.ticket_price);

        if (!Number.isInteger(tickets) || tickets < 1) {
            setError("Enter a valid number of tickets.");
            return;
        }

        if (tickets > selectedMatch.available_seats) {
            setError("Not enough seats available.");
            return;
        }

        setBookingLoading(true);
        setError("");
        setMessage("");

        // Reduce available seats
        const { data: updatedMatch, error: updateError } =
            await supabase
                .from("matches")
                .update({
                    available_seats:
                        selectedMatch.available_seats - tickets
                })
                .eq("id", selectedMatch.id)
                .gte("available_seats", tickets)
                .select()
                .maybeSingle();

        if (updateError || !updatedMatch) {
            setError(
                updateError?.message ||
                "Seats could not be reserved. Please refresh and try again."
            );
            setBookingLoading(false);
            await fetchMatches();
            return;
        }

        // Insert booking record
        const { error: bookingError } = await supabase
            .from("bookings")
            .insert([
                {
                    match_id: selectedMatch.id,
                    customer_name: name,
                    customer_email: email,
                    number_of_tickets: tickets,
                    total_amount: price * tickets
                }
            ]);

        if (bookingError) {
            // Restore seats if booking insertion fails
            await supabase
                .from("matches")
                .update({
                    available_seats: updatedMatch.available_seats + tickets
                })
                .eq("id", selectedMatch.id);

            setError(bookingError.message);
        } else {
            setMessage(
                "Booking successful! Total amount: ₹" +
                (price * tickets)
            );

            setSelectedMatch(null);
            setName("");
            setEmail("");
            setQuantity(1);
        }

        await fetchMatches();
        setBookingLoading(false);
    }

    // Filter matches
    const filteredMatches = matches.filter((match) =>
        selectedTeam === "All" ||
        match.team1 === selectedTeam ||
        match.team2 === selectedTeam
    );

    const teams = [...new Set(
        matches.flatMap(match => [match.team1, match.team2])
    )];

    return (
        <>
            <Navbar />
            <Hero />

            <section id="matches">
                <h2>IPL 2026 Match Schedule</h2>

                <label>Filter by Team: </label>

                <select
                    value={selectedTeam}
                    onChange={(event) =>
                        setSelectedTeam(event.target.value)
                    }
                >
                    <option value="All">All Teams</option>

                    {teams.map(team => (
                        <option key={team} value={team}>
                            {team}
                        </option>
                    ))}
                </select>

                {loading && <p>Loading matches...</p>}

                {error && <p className="error-message">{error}</p>}

                <div className="match-container">
                    {filteredMatches.map(match => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onBook={openBooking}
                        />
                    ))}
                </div>
            </section>

            {/* Booking Form */}
            <section id="booking">
                <h2>Book Your IPL Ticket</h2>

                {selectedMatch ? (
                    <form
                        className="booking-form"
                        onSubmit={handleBooking}
                    >
                        <h3>
                            {selectedMatch.team1} vs {selectedMatch.team2}
                        </h3>

                        <p>
                            Venue: {selectedMatch.venue}
                        </p>

                        <p>
                            Ticket Price: ₹{selectedMatch.ticket_price}
                        </p>

                        <p>
                            Available Seats: {selectedMatch.available_seats}
                        </p>

                        <label>Customer Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />

                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Number of Tickets</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedMatch.available_seats}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />

                        <p>
                            **Total Amount:** ₹
                            {Number(quantity) *
                                Number(selectedMatch.ticket_price)}
                        </p>

                        <button
                            type="submit"
                            disabled={bookingLoading}
                        >
                            {bookingLoading
                                ? "Processing..."
                                : "Confirm Booking"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedMatch(null)}
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <p>Select a match and click Book Ticket to enter your details.</p>
                )}

                {message && (
                    <p className="success-message">{message}</p>
                )}

                {error && (
                    <p className="error-message">{error}</p>
                )}
            </section>
        </>
    );
}

export default App;
