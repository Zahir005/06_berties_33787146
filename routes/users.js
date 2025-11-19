// Create a new router
const express = require("express");
const router = express.Router();


// bcrypt for hashing passwords
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Show registration form
router.get("/register", function (req, res) {
    res.render("register.ejs");
});

// === Show login form ===
router.get("/login", function (req, res) {
    res.render("login.ejs");
});


// List all users
router.get('/listusers', function(req, res, next) {
    let sqlquery = "SELECT * FROM users"; // Query database to get all the users

    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        // Render the new listusers.ejs file and pass the data as 'availableUsers'
        res.render("listusers.ejs", { availableUsers: result }); 
    });
});

// Handle registration form
router.post("/registered", function (req, res, next) {

    // Task 11 will use req.body.password + hashedPassword
    const plainPassword = req.body.password;

    // Hash the password
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
            return next(err);
        }

      
        // TASK 10 — STORE IN DATABASE
        // ============================
        // Insert into the "users" table
        let sqlquery = "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)";
        let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return next(err);
            }

          
            // TASK 11 — OUTPUT PASSWORD + HASHED PASSWORD
           
            let output = 'Hello ' + req.body.first + ' ' + req.body.last +
                ' you are now registered! We will send an email to you at ' + req.body.email + '<br>';

            output += 'Your password is: ' + req.body.password +
                ' and your hashed password is: ' + hashedPassword;

            res.send(output);
        });

    });
});

//audit log
function logAudit(username, success, req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const sqlquery = "INSERT INTO login_audits (username, login_time, success, ip_address) VALUES (?, NOW(), ?, ?)";
    const values = [username, success, ipAddress];

    db.query(sqlquery, values, (err) => {
        if (err) {
            console.error('Audit Logging Failed:', err);
        }
    })
}


// === Task 16: /users/loggedin – check username + password ===
router.post("/loggedin", function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Get the stored hashed password for this user
    const sqlquery = "SELECT username, firstName, hashedPassword FROM users WHERE username = ?";

    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err);
            logAudit(username, false, req);
        }

        if (result.length === 0) {
            // No such user
            logAudit(username, false, req);
            return res.send("Login failed: incorrect username or password.");
        }

        const user = result[0];
        const hashedPassword = user.hashedPassword;

        // 2. Compare the password from the form with the hashed password from DB
        bcrypt.compare(password, hashedPassword, function (err, match) {
            if (err) {
                return next(err);
                logAudit(username, false, req);
            }

            if (match === true) {
                // Successful login
                logAudit(username, true, req);
                res.send("Hello " + user.firstName + ", you have successfully logged in!");
            } else {
                // Wrong password
                res.send("Login failed: incorrect username or password.");
                logAudit(username, false, req);
            }
        });
    });
});

router.get('/audit', function(req, res, next) {
    let sqlqeury = "SELECT username, login_time, success, ip_address FROM login_audits ORDER BY login_time DESC";

    db.query(sqlqeury, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("audit.ejs", {auditRecords: result});
    })
});


// ===== Task 13: /users/list route – show all users (no passwords) =====

router.get("/list", function (req, res, next) {
    // only select non-sensitive fields
    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }

        // render the listusers page and pass the user data
        res.render("listusers.ejs", { availableUsers: result });
    });
});


// Export the router
module.exports = router;
