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

// oppdaterer statusen til en ticket
// (valgfritt) legger til en kommentar
async function updateTicketStatus(ticketId, statusId, comment) {
    try {
        // oppdaterer statusen til en ticket
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
            // hvis comment finnes
            // og ikke bare er tom tekst
            if (comment && comment.trim()) {
                const commentResponse = await fetch("/addComment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ticket_id: ticketId,
                        comment_text: comment
                    })
                });
                
                if (!commentResponse.ok) {
                    alert("Status updated but comment failed to save");
                }
            }

            alert(result.message);
            // tømmer ticket-listen
            // laster den inn på nytt (med oppdatert status)
            document.querySelector("#ticketList").innerHTML = "<h1>Ticket List</h1>";
            loadTickets();
        }
    } catch (error) {
        alert("Error updating status: " + error.message);
    }
}

// funksjon for å hente alle kommentarer
async function loadComments(ticketId, container) {
    try {
        const response = await fetch(`/getComments/${ticketId}`);
        if (!response.ok) throw new Error("Could not load comments");
        
        const data = await response.json();
        
        if (data.comments.length === 0) {
            container.innerHTML = "<p style='color: #888;'>No comments yet</p>";
            return;
        }
        
        container.innerHTML = "";
        data.comments.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.style.backgroundColor = "#f5f5f5";
            commentDiv.style.padding = "10px";
            commentDiv.style.marginBottom = "8px";
            commentDiv.style.borderRadius = "3px";
            commentDiv.style.borderLeft = "3px solid #007bff";
            
            const author = document.createElement("strong");
            author.textContent = comment.firstname + " " + comment.lastname;
            commentDiv.appendChild(author);
            
            const date = document.createElement("small");
            date.textContent = " - " + new Date(comment.created_at).toLocaleDateString();
            date.style.color = "#888";
            commentDiv.appendChild(date);
            
            const text = document.createElement("p");
            text.textContent = comment.comment_text;
            text.style.margin = "8px 0 0 0";
            commentDiv.appendChild(text);
            
            container.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// funksjon for å vise alle DINE tickets
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

            const commentsSection = document.createElement("div");
            commentsSection.style.marginTop = "15px";
            commentsSection.style.paddingTop = "15px";
            commentsSection.style.borderTop = "1px solid #ddd";
            
            const commentsTitle = document.createElement("strong");
            commentsTitle.textContent = "Comments:";
            commentsSection.appendChild(commentsTitle);
            
            const commentsContainer = document.createElement("div");
            commentsContainer.id = "comments_" + ticket.id;
            commentsContainer.style.marginTop = "10px";
            commentsSection.appendChild(commentsContainer);
            
            ticketCard.appendChild(commentsSection);
            loadComments(ticket.id, commentsContainer);
            
            tabellBody.appendChild(ticketCard);
        });
    } catch (error) {
        console.error("Error loading your tickets:", error);
        document.querySelector("main > div").innerHTML = "<p>Error loading your tickets</p>";
    }
}


// load all tickets created
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

            const role = document.createElement("p");
            role.textContent = "Assigned Role: " + ticket.role_name;
            ticketCard.appendChild(role);
            
            const status = document.createElement("p");
            status.textContent = "Status: " + ticket.status_name;
            ticketCard.appendChild(status);
            
            const created = document.createElement("p");
            created.textContent = "Created: " + new Date(ticket.created_at).toLocaleDateString();
            ticketCard.appendChild(created);

            const commentsSection = document.createElement("div");
            commentsSection.style.marginTop = "15px";
            commentsSection.style.paddingTop = "15px";
            commentsSection.style.borderTop = "1px solid #ddd";

            const commentsTitle = document.createElement("strong");
            commentsTitle.textContent = "Comments:";
            commentsSection.appendChild(commentsTitle);

            const commentsContainer = document.createElement("div");
            commentsContainer.id = "comments_" + ticket.id;
            commentsContainer.style.marginTop = "10px";
            commentsSection.appendChild(commentsContainer);

            ticketCard.appendChild(commentsSection);
            loadComments(ticket.id, commentsContainer);

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

                const commentLabel = document.createElement("label");
                commentLabel.textContent = "Add Comment (optional): ";
                commentLabel.style.display = "block";
                commentLabel.style.marginTop = "10px";
                ticketCard.appendChild(commentLabel);

                const commentTextarea = document.createElement("textarea");
                commentTextarea.id = "comment_" + ticket.id;
                commentTextarea.placeholder = "Add a comment...";
                commentTextarea.style.width = "100%";
                commentTextarea.style.minHeight = "80px";
                ticketCard.appendChild(commentTextarea);
                
                const updateButton = document.createElement("button");
                updateButton.textContent = "Update Status";
                updateButton.style.marginTop = "10px";
                updateButton.onclick = () => {
                    const newStatusId = statusSelect.value;
                    const commentText = commentTextarea.value;
                    updateTicketStatus(ticket.id, newStatusId, commentText);
                };
                ticketCard.appendChild(updateButton);
            }
            
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