
/* =====================================
   CHESSBOT NETWORK (CBN)
   ARENA TOURNAMENTS
===================================== */

const TEAM_ID = "chessbot-network-cbn";


// =====================================
// GET NDJSON FROM LICHESS
// =====================================

async function loadNDJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Lichess API error");
    }

    const text = await response.text();

    return text
        .trim()
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => JSON.parse(line));
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(timestamp) {
    if (!timestamp) {
        return "Date unknown";
    }

    return new Date(timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


// =====================================
// FORMAT DURATION
// =====================================

function formatDuration(seconds) {
    if (!seconds) {
        return "";
    }

    const minutes = Math.round(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining === 0
        ? `${hours}h`
        : `${hours}h ${remaining}min`;
}


// =====================================
// CREATE TOURNAMENT CARD
// =====================================

function createTournamentCard(tournament, status) {
    const card = document.createElement("div");
    card.className = "card tournament-card";

    let statusText = "Finished";

    if (status === "current") {
        statusText = "In progress";
    } else if (status === "upcoming") {
        statusText = "Upcoming";
    }

    const name =
        tournament.fullName ||
        tournament.name ||
        "CBN Arena Tournament";

    const players =
        tournament.nbPlayers !== undefined
            ? `<p>${tournament.nbPlayers} players</p>`
            : "";

    const duration = tournament.seconds
        ? `<p>Duration: ${formatDuration(tournament.seconds)}</p>`
        : "";

    const startDate = tournament.startsAt
        ? `<p>Start: ${formatDate(tournament.startsAt)}</p>`
        : "";

    const tournamentUrl =
        `https://lichess.org/tournament/${encodeURIComponent(tournament.id)}`;

    const title = document.createElement("h3");
    title.textContent = name;

    const statusElement = document.createElement("p");
    statusElement.className = "tournament-status";
    statusElement.textContent = statusText;

    card.appendChild(title);
    card.appendChild(statusElement);

    if (startDate) {
        card.insertAdjacentHTML("beforeend", startDate);
    }

    if (duration) {
        card.insertAdjacentHTML("beforeend", duration);
    }

    if (players) {
        card.insertAdjacentHTML("beforeend", players);
    }

    const link = document.createElement("a");
    link.className = "button";
    link.href = tournamentUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open on Lichess";

    card.appendChild(link);

    return card;
}


// =====================================
// DISPLAY TOURNAMENTS
// =====================================

function displayTournaments(tournaments, containerId, status) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!tournaments || tournaments.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "card empty-card";

        const message = document.createElement("p");
        message.textContent = "No tournaments available right now.";

        emptyCard.appendChild(message);
        container.appendChild(emptyCard);

        return;
    }

    tournaments.forEach(tournament => {
        container.appendChild(
            createTournamentCard(tournament, status)
        );
    });
}


// =====================================
// ERROR MESSAGE
// =====================================

function showError(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    const errorCard = document.createElement("div");
    errorCard.className = "card";

    const message = document.createElement("p");
    message.textContent =
        "Unable to load tournaments. Please try again later.";

    errorCard.appendChild(message);
    container.replaceChildren(errorCard);
}


// =====================================
// LOAD ARENA TOURNAMENTS
// =====================================

async function loadArena() {
    try {
        const [current, upcoming, finished] = await Promise.all([
            loadNDJSON(
                `https://lichess.org/api/team/${TEAM_ID}/arena?max=30&status=started`
            ),
            loadNDJSON(
                `https://lichess.org/api/team/${TEAM_ID}/arena?max=30&status=created`
            ),
            loadNDJSON(
                `https://lichess.org/api/team/${TEAM_ID}/arena?max=30&status=finished`
            )
        ]);

        displayTournaments(current, "arenaCurrent", "current");
        displayTournaments(upcoming, "arenaUpcoming", "upcoming");
        displayTournaments(finished, "arenaFinished", "finished");
    } catch (error) {
        console.error("CBN Arena error:", error);

        showError("arenaCurrent");
        showError("arenaUpcoming");
        showError("arenaFinished");
    }
}


// =====================================
// START
// =====================================

loadArena();
