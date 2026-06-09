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

async function userInfo() {
    try {
        const response = await fetch("/getUserInfo");
        if (!response.ok) {
            throw new Error("Could not get user info");
        }
        const user = await response.json();
        document.getElementById("userInfo").textContent = "Hello " + user.username + ". " + "You are currently a " + user.role_name;
    } catch (error) {
        console.error("Feil:", error);
    }
}
userInfo();