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
        if (!response.ok) {
            throw new Error("Could not load tickets");
        }

        const data = await response.json();
        const ticketsDiv = document.querySelector("main > div");
        
        if (data.tickets.length === 0) {
            ticketsDiv.innerHTML = "<p>No tickets found</p>";
            return;
        }
        
        ticketsDiv.innerHTML = "";
        
        data.tickets.forEach(ticket => {
            const ticketCard = document.createElement("div");
            ticketCard.classList.add("ticket-card");
            ticketCard.style.border = "1px solid #ccc";
            ticketCard.style.padding = "15px";
            ticketCard.style.marginBottom = "15px";
            ticketCard.style.borderRadius = "5px";
            
            const ticketId = document.createElement("p");
            ticketId.textContent = "Ticket ID: " + ticket.id;
            ticketCard.appendChild(ticketId);
            
            const title = document.createElement("h2");
            title.textContent = ticket.title;
            ticketCard.appendChild(title);
            
            const description = document.createElement("p");
            description.textContent = "Description: " + ticket.description;
            ticketCard.appendChild(description);
            
            const user = document.createElement("p");
            user.textContent = "User: " + ticket.firstname + " " + ticket.lastname + " (" + ticket.email + ")";
            ticketCard.appendChild(user);
            
            const status = document.createElement("p");
            status.textContent = "Status: " + ticket.status_name;
            ticketCard.appendChild(status);
            
            const created = document.createElement("p");
            created.textContent = "Created: " + new Date(ticket.created_at).toLocaleDateString();
            ticketCard.appendChild(created);
            
            ticketsDiv.appendChild(ticketCard);
        });
    } catch (error) {
        console.error("Error loading tickets:", error);
        document.querySelector("main > div").innerHTML = "<p>Error loading tickets</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTickets();
});