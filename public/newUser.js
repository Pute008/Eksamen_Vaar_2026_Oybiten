async function generateUsername() {
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const usernameField = document.getElementById("username");

    if (!firstname || !lastname) {
        usernameField.value = "";
        return;
    }

    try {
        const response = await fetch(`/generateUsername?firstname=${encodeURIComponent(firstname)}&lastname=${encodeURIComponent(lastname)}`);
        if (!response.ok) throw new Error("Could not generate username");
        
        const data = await response.json();
        usernameField.value = data.username;
    } catch (error) {
        console.error("Error generating username:", error);
    }
}

document.getElementById("newUserForm").addEventListener("submit", async function addPerson(event) {
    event.preventDefault();

    // henter verdier fra html-element
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;
    const tlf = document.getElementById("tlf").value;
    // const role = document.getElementById("role").value;
    const postadresse = document.getElementById("postadresse").value;

    try {
        const response = await fetch("/newUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                password,
                username,
                tlf,
                // role,
                postadresse
            })
            
        });

        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + (result.error || result.message));
        } else {
            alert(result.message);
            document.getElementById("newUserForm").reset();
            window.location.href='./index.html';
        }
    } catch (error) {
        alert("Error creating user: " + error.message);
    }
})

// async function loadRoles() {
//     try {
//         const response = await fetch("/getRoles");
//         if (!response.ok) throw new Error("Could not load roles");
//         const roles = await response.json();
//         const select = document.getElementById("role");
//         roles.forEach(roleItem => {
//             const option = document.createElement("option");
//             option.value = roleItem.id;
//             option.textContent = roleItem.name;
//             select.appendChild(option);
//         });
//     } catch (error) {
//         console.error("Error loading roles:", error);
//     }
// }

async function loadPostadresse() {
    try {
        const response = await fetch("/getPostadresse");
        if (!response.ok) throw new Error("Could not load classes");
        const postadresse = await response.json();
        const select = document.getElementById("postadresse");
        postadresse.forEach(classItem => {
            const option = document.createElement("option");
            option.value = classItem.id;
            option.textContent = classItem.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading postadresse:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // loadRoles();
    loadPostadresse();
    
    // Generer brukernavn når fornavn eller etternavn endres
    document.getElementById("firstname").addEventListener("input", generateUsername);
    document.getElementById("lastname").addEventListener("input", generateUsername);
});