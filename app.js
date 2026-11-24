

function showToast(message) {

    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

document.querySelectorAll('a[href*="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const url = new URL(link.href, window.location.href);

        if (url.pathname === window.location.pathname && url.hash) {

            const target = document.querySelector(url.hash);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        }
    });
});

window.addEventListener("load", function () {

    if (window.location.hash === "#booking") {

        const bookingSection =
            document.getElementById("booking");

        if (bookingSection) {

            bookingSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            showToast(
                "Welcome! You can book your IPL tickets now."
            );
        }
    }
});

const bookingForm = document.getElementById("bookingForm");

const matchSelect = document.getElementById("match");

const standSelect = document.getElementById("stand");

const ticketsInput = document.getElementById("tickets");

const summaryMatch = document.getElementById("summaryMatch");

const summaryStand = document.getElementById("summaryStand");

const summaryTickets = document.getElementById("summaryTickets");

const summaryPrice = document.getElementById("summaryPrice");

const summaryTotal = document.getElementById("summaryTotal");

function updateBookingSummary() {

    if (
        !matchSelect ||
        !standSelect ||
        !ticketsInput ||
        !summaryMatch ||
        !summaryStand ||
        !summaryTickets ||
        !summaryPrice ||
        !summaryTotal
    ) {
        return;
    }

    const selectedMatch = matchSelect.value;

    const selectedStand = standSelect.value;

    const quantity = Number(ticketsInput.value);

    const selectedOption =
        standSelect.options[standSelect.selectedIndex];

    const price =
        Number(selectedOption.dataset.price) || 0;

    const validQuantity =
        Number.isInteger(quantity) &&
        quantity >= 1 &&
        quantity <= 10;

    const total = validQuantity
        ? price * quantity
        : 0;

    summaryMatch.textContent =
        selectedMatch || "Not Selected";

    summaryStand.textContent =
        selectedStand || "Not Selected";

    summaryTickets.textContent =
        ticketsInput.value || "Not Selected";

    summaryPrice.textContent = price;

    summaryTotal.textContent = total;

}

if (matchSelect && standSelect && ticketsInput) {

    matchSelect.addEventListener("change", function () {

        updateBookingSummary();

        showToast("Match selection updated!");

    });

    standSelect.addEventListener("change", function () {

        updateBookingSummary();

        showToast("Stand category updated!");

    });

    ticketsInput.addEventListener("input", function () {

        updateBookingSummary();

    });

    ticketsInput.addEventListener("change", function () {

        updateBookingSummary();

        showToast("Ticket quantity updated!");

    });

    updateBookingSummary();

    if (bookingForm) {

        bookingForm.addEventListener("reset", function () {

            setTimeout(function () {

                updateBookingSummary();

            }, 0);

        });

    }

}

if (bookingForm) {

    bookingForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (bookingForm.checkValidity()) {

            showToast(
                "Order accepted! Your IPL ticket booking has been submitted successfully."
            );

            bookingForm.reset();

        } else {

            bookingForm.reportValidity();

        }

    });

}

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
        mainNav.classList.toggle("active");

        const isOpen = mainNav.classList.contains("active");
        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            mainNav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });
}

const teamFilter = document.getElementById("teamFilter");
const matchContainer = document.getElementById("matchContainer");
const noMatches = document.getElementById("noMatches");
const gridView = document.getElementById("gridView");
const listView = document.getElementById("listView");

function filterMatches() {
    if (!teamFilter || !matchContainer) {
        return;
    }

    const selectedTeam = teamFilter.value;
    const matchCards = matchContainer.querySelectorAll(".match-card");
    let visibleCount = 0;

    matchCards.forEach(function (card) {
        const teams = card.dataset.team.split(" ");
        const showCard = selectedTeam === "all" ||
            teams.includes(selectedTeam);

        card.hidden = !showCard;

        if (showCard) {
            visibleCount++;
        }
    });

    if (noMatches) {
        noMatches.hidden = visibleCount !== 0;
    }
}

if (teamFilter) {
    teamFilter.addEventListener("change", filterMatches);
}

if (gridView && listView && matchContainer) {
    gridView.addEventListener("click", function () {
        matchContainer.classList.remove("list-view");
    });

    listView.addEventListener("click", function () {
        matchContainer.classList.add("list-view");
    });
}
