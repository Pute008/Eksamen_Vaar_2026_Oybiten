document.getElementById("newUserForm").addEventListener("submit", async function addPerson(event) {
    event.preventDefault();

    // henter verdier fra html-element
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(email)
    const response = await fetch("/newUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstname,
            lastname,
            email,
            password
        })
        
    });

    const result = await response.json();
    alert(result.message);
    window.location.href='./index.html';
})
