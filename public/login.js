async function loginPerson(event) {
    event.preventDefault();

    // henter verdier fra html-element
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // bruker login-ruten i app-filen
    const response = await fetch('/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        // sender informasjonen 
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