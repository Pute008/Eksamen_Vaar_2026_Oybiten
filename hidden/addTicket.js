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

async function loadRoles() {
    try {
        const response = await fetch("/getRoles");
        if (!response.ok) throw new Error("Could not load roles");
        const roles = await response.json();
        const select = document.getElementById("role");
        roles.forEach(roleItem => {
            const option = document.createElement("option");
            option.value = roleItem.id;
            option.textContent = roleItem.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading roles:", error);
    }
}

document.getElementById("addTicketForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const role = document.getElementById("role").value;

    try {
        const response = await fetch("/addTicket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                role
            })
        });

        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + (result.error || result.message));
        } else {
            alert(result.message);
            document.getElementById("addTicketForm").reset();
        }
    } catch (error) {
        alert("Error creating ticket: " + error.message);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadRoles();
});