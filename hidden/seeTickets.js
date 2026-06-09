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

let allStatuses = [];

async function loadStatuses() {
    try {
        const response = await fetch("/getStatus");
        if (!response.ok) throw new Error("Could not load statuses");
        allStatuses = await response.json();
    } catch (error) {
        console.error("Error loading statuses:", error);
    }
}

async function updateTicketStatus(ticketId, statusId) {
    try {
        const response = await fetch("/updateTicketStatus", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ticket_id: ticketId,
                status_id: statusId
            })
        });
        
        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + (result.error || result.message));
        } else {
            alert(result.message);
            // Reload tickets
            document.querySelector("#ticketList").innerHTML = "<h1>Ticket List</h1>";
            loadTickets();
        }
    } catch (error) {
        alert("Error updating status: " + error.message);
    }
}

async function loadYourTickets() {
    const tabellBody = document.querySelector("#yourTickets");
    try {
        const response = await fetch("/seeYourTickets");
        if (!response.ok) {
            throw new Error("Could not load your tickets");
        }

        const data = await response.json();
        
        if (data.tickets.length === 0) {
            tabellBody.innerHTML = "<p>No tickets found</p>";
            return;
        }
        data.tickets.forEach(ticket => {
            const ticketCard = document.createElement("div");
            ticketCard.classList.add("ticket-card");
            ticketCard.style.border = "1px solid #ccc";
            ticketCard.style.padding = "15px";
            ticketCard.style.marginBottom = "15px";
            ticketCard.style.borderRadius = "5px";
            if (ticket.status_name == "Solved") {
                ticketCard.classList.add("ticket-solved");
            } else if (ticket.status_name == "New") {
                ticketCard.classList.add("ticket-new");
            }
            ticketCard.classList.add('class');
            
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
            
            tabellBody.appendChild(ticketCard);
        });
    } catch (error) {
        console.error("Error loading your tickets:", error);
        document.querySelector("main > div").innerHTML = "<p>Error loading your tickets</p>";
    }
}



async function loadTickets() {
    const tabellBody = document.querySelector("#ticketList");
    try {
        const response = await fetch("/seeTickets");
        if (!response.ok) {
            throw new Error("Could not load tickets");
        }

        const data = await response.json();
        
        if (data.tickets.length === 0) {
            tabellBody.innerHTML = "<p>No tickets found</p>";
            return;
        }

        ticketList.style.display = 'block';        
        data.tickets.forEach(ticket => {
            const ticketCard = document.createElement("div");
            ticketCard.classList.add("ticket-card");
            ticketCard.style.border = "1px solid #ccc";
            ticketCard.style.padding = "15px";
            ticketCard.style.marginBottom = "15px";
            ticketCard.style.borderRadius = "5px";
            ticketCard.classList.add('class');
            
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

            // Add status dropdown and update button for support/admin
            if (allStatuses.length > 0) {
                const statusLabel = document.createElement("label");
                statusLabel.textContent = "Change Status: ";
                ticketCard.appendChild(statusLabel);
                
                const statusSelect = document.createElement("select");
                statusSelect.id = "status_" + ticket.id;
                allStatuses.forEach(status => {
                    const option = document.createElement("option");
                    option.value = status.status_id;
                    option.textContent = status.status_name;
                    statusSelect.appendChild(option);
                });
                ticketCard.appendChild(statusSelect);
                
                const updateButton = document.createElement("button");
                updateButton.textContent = "Update Status";
                updateButton.onclick = () => {
                    const newStatusId = statusSelect.value;
                    updateTicketStatus(ticket.id, newStatusId);
                };
                ticketCard.appendChild(updateButton);
            }

            const button = document.createElement("button");
            button.textContent = "More info";
            button.onclick = () => window.location.href = "/updateTicket.html";
            ticketCard.appendChild(button);
            
            tabellBody.appendChild(ticketCard);
        });
    } catch (error) {
        console.error("Error loading tickets:", error);
        // document.querySelector("main > div").innerHTML = "<p>Error loading tickets</p>";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadStatuses();
    loadYourTickets();
    loadTickets();
});