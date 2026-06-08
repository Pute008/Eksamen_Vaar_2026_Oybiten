async function logout() {
    const response = await fetch("/logout", {
        method: "POST"
    });

    if (response.ok) {
        alert("You are logged out.");
        window.location.href = "/";
    } else {
        alert("Something went wrong");
    }
}

async function loadTickets() {
    try {
        const response = await fetch("/seeTickets");
        if (!response.ok)throw new Error("Could not load tickets");

        const data = await response.json();
        const ticketsDiv = document.querySelector("main > div");
        
        if (data.tickets.length === 0) {
            ticketsDiv.innerHTML = "<p>No tickets found</p>";
            return;
        }
        
        let html = "<table border='1'><tr><th>ID</th><th>Title</th><th>Description</th><th>User</th><th>Email</th><th>Status</th><th>Created</th></tr>";
        data.tickets.forEach(ticket => {
            html += `<tr><td>${ticket.id}</td><td>${ticket.title}</td><td>${ticket.description}</td><td>${ticket.firstname} ${ticket.lastname}</td><td>${ticket.email}</td><td>${ticket.status_name}</td><td>${new Date(ticket.created_at).toLocaleDateString()}</td></tr>`;
        });
        html += "</table>";
        ticketsDiv.innerHTML = html;
    } catch (error) {
        console.error("Error loading tickets:", error);
        document.querySelector("main > div").innerHTML = "<p>Error loading tickets</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTickets();
});