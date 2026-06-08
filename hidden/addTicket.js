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

document.getElementById("addTicketForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
        const response = await fetch("/addTicket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description
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