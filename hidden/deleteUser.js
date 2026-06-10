async function loginPersonDelete(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('/loginDelete', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        await deleteUser(email, password);
    } else {
        alert(result.message);
    }
}

async function deleteUser(email, password) {

    // bruker en rute fra app.js
    const response = await fetch('/deleteUser', {
        // metoden er å SLETTE
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // sender disse verdiene i json format
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        window.location.href = result.redirect;
    } else {
        alert(result.message);
    }
}