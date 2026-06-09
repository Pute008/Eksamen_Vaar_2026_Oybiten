const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("kundeportal_oybiten.db");

const cors = require("cors");
app.use(cors());

const bcrypt = require("bcrypt");

app.use(express.static("public"));

app.use(express.json());

const port = 3000

app.use(
    session({
        secret: "hemmeligNøkkel",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

function kreverInnlogging(req, res, next) {
    if(!req.session.users) {
        return res.redirect('/index.html');
    }
    next();
}

function kreverRolle(...roller) {
    return (req, res, next) => {
        if (!req.session.users) { // Dersom brukeren ikke har en session (er logga inn)
            return res.redirect("/");
        }
        if (!roller.includes(req.session.users.role)) { // Dersom brukeren sin rolle ikke er i listen over roller som har tilgang
            return res.status(403).json({ message: "Ingen tilgang" });
        }
        next();
    };
}

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const users = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!users) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    const passordErGyldig = await bcrypt.compare(password, users.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    req.session.users = { id: users.user_id, firstname: users.firstname, lastname: users.lastname, role: users.role_id };
    res.json({ message: "Login successful", redirect: "home.html" })
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})

app.post("/newUser", async (req, res) => {
    const { firstname, lastname, email, password, username, tlf, postadresse } = req.body;
    const role = 1;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (firstname, lastname, email, password, username, tlf, role_id, post_nr) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    // oppsummerer operasjonen som har blitt utført
    try {
        const info = stmt.run(firstname, lastname, email, hashPassword, username, tlf, role, postadresse);
        res.json({ message: "New user created successfully", info });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/adminNewUser", kreverRolle(3), async (req, res) => {
    const { firstname, lastname, email, password, username, tlf, role, postadresse } = req.body;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (firstname, lastname, email, password, username, tlf, role_id, post_nr) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    // oppsummerer operasjonen som har blitt utført
    try {
        const info = stmt.run(firstname, lastname, email, hashPassword, username, tlf, role, postadresse);
        res.json({ message: "New user created successfully", info });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getUserInfo', (req, res) => {
    const userID = req.session.users.id;
    try {
        const user = db.prepare(`SELECT users.firstname, users.lastname,
            users.username, users.tlf,
            users.email, users.password,
            postadresse.post_nr, postadresse.poststed,
            roles.role_name
            FROM users 
            JOIN postadresse
            ON users.post_nr = postadresse.post_nr
            JOIN roles
            ON users.role_id = roles.role_id
            WHERE users.user_id = ?`).get(userID);
        res.json(user);
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getRoles', (req, res) => {
    try {
        const roles = db.prepare("SELECT role_id as id, role_name as name FROM roles").all();
        res.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getPostadresse', (req, res) => {
    try {
        const postadresse = db.prepare("SELECT post_nr as id, poststed as name FROM postadresse").all();
        res.json(postadresse);
    } catch (error) {
        console.error("Error fetching postadresse:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getStatus', (req, res) => {
    try {
        const status = db.prepare("SELECT * FROM status").all();
        res.json(status);
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/generateUsername', (req, res) => {
    try {
        const { firstname, lastname } = req.query;
        if (!firstname || !lastname) {
            return res.status(400).json({ error: "firstname and lastname required" });
        }

        // Lag grunnlag for brukernavn: fornavn.etternavn
        const baseUsername = `${firstname.toLowerCase()}.${lastname.toLowerCase()}`.replace(/\s+/g, '');
        
        // Sjekk om brukernavnet finnes allerede
        let username = baseUsername;
        let counter = 1;
        
        // hvis brukernavnet eksisterer vil den legge til et tall i brukernavnet
        while (true) {
            // sjekker om noen har samme brukernavn
            const existing = db.prepare("SELECT user_id FROM users WHERE username = ?").get(username);
            if (!existing) {
                // Brukernavnet er ledig
                res.json({ username });
                return;
            }
            // Hvis det finnes, legg til nummer
            username = `${baseUsername}${counter}`;
            counter++;
        }
    } catch (error) {
        console.error("Error generating username:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/addTicket", kreverInnlogging, async (req, res) => {
    try {
        const { title, description } = req.body;
        const user_id = req.session.users.id;
        const status_id = 5; // Status "New"
        
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        
        const stmt = db.prepare("INSERT INTO ticket (user_id, status_id, title, description, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
        const info = stmt.run(user_id, status_id, title, description);
        res.json({ message: "Ticket created successfully", info });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/seeTickets", kreverRolle(2, 3), (req, res) => {
    try {
        const tickets = db.prepare("SELECT t.id, t.title, t.description, t.created_at, s.status_name, u.firstname, u.lastname, u.email FROM ticket t JOIN Status s ON t.status_id = s.status_id JOIN users u ON t.user_id = u.user_id ORDER BY t.created_at DESC").all();
        res.json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/seeYourTickets", kreverInnlogging, (req, res) => {
    const userID = req.session.users.id;
    try {
        const tickets = db.prepare(`SELECT t.id, t.title, t.description, t.created_at, s.status_name, u.firstname, u.lastname, u.email
            FROM ticket t
            JOIN Status s
            ON t.status_id = s.status_id
            JOIN users u
            ON t.user_id = u.user_id
            WHERE u.user_id = ?`).all(userID);
        res.json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/updateTicketStatus", kreverRolle(2, 3), async (req, res) => {
    try {
        const { ticket_id, status_id } = req.body;
        
        if (!ticket_id || !status_id) {
            return res.status(400).json({ error: "Ticket ID and Status ID are required" });
        }
        
        const stmt = db.prepare("UPDATE ticket SET status_id = ? WHERE id = ?");
        const info = stmt.run(status_id, ticket_id);
        res.json({ message: "Ticket status updated successfully", info });
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/addComment", kreverRolle(2, 3), async (req, res) => {
    try {
        const { ticket_id, comment_text } = req.body;
        const user_id = req.session.users.id;
        
        if (!ticket_id || !comment_text) {
            return res.status(400).json({ error: "Ticket ID and comment text are required" });
        }
        
        const stmt = db.prepare("INSERT INTO comments (ticket_id, user_id, comment_text, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        const info = stmt.run(ticket_id, user_id, comment_text);
        res.json({ message: "Comment added successfully", info });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: error.message });
    }
});

// :ticketId = en parameter i URL-en
// rute for å vise/hente alle kommentarer
app.get("/getComments/:ticketId", kreverInnlogging, (req, res) => {
    try {
        // henter id fra parameter
        const { ticketId } = req.params;
        const comments = db.prepare(`
            SELECT c.comment_id as id, c.comment_text, c.created_at, u.firstname, u.lastname
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.ticket_id = ?
            ORDER BY c.created_at ASC
        `).all(ticketId);
        res.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: error.message });
    }
});


// rute til html sider
app.get('/addTicket.html', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/addTicket.html");
})

app.get('/seeTickets.html', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/seeTickets.html");
})

app.get('/addUser.html', kreverRolle(3), (req, res) => {
    res.sendFile(__dirname + "/hidden/addUser.html");
})

// ruter for å koble til js
app.get('/addTicket.js', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/addTicket.js");
})

app.get('/seeTickets.js', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/seeTickets.js");
})

app.get('/addUser.js', kreverRolle(3), (req, res) => {
    res.sendFile(__dirname + "/hidden/addUser.js");
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});