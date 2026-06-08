const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("skole.db");

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