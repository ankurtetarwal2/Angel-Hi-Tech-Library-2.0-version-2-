const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});


// Connect to MySQL

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});



// SAVE MEMBER
app.post("/add-member", (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO members (
        library_id,
        seat_no,
        first_name,
        last_name,
        father_name,
        age,
        contact,
        address,
        goal,
        membership_plan,
        exam_targeting,
        other_info,
        start_date,
        due_date,
        reminder_date,
        account_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.library_id,
        data.seat_no,
        data.first_name,
        data.last_name,
        data.father_name,
        data.age,
        data.contact,
        data.address,
        data.goal,
        data.membership_plan,
        data.exam_targeting,
        data.other_info,
        data.start_date,
        data.due_date,
        data.reminder_date,
        data.account_status
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send("Error");
        } else {
            res.send("Member Added");
        }

    });

});


// GET MEMBERS
app.get("/members", (req, res) => {

    db.query("SELECT * FROM members", (err, result) => {

        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }

    });

});



/*  db.query(`SELECT *, 
    DATE_FORMAT(start_date, '%d-%m-%Y') as start_date,
    DATE_FORMAT(due_date, '%d-%m-%Y') as due_date,
    DATE_FORMAT(reminder_date, '%d-%m-%Y') as reminder_date
    FROM members WHERE due_date <= CURDATE()`, (err, result) => { */


    
    
// UPDATE MEMBER
app.put("/update-member/:library_id", (req, res) => {

    const data = req.body;
    const library_id = req.params.library_id;

    const sql = `
    UPDATE members SET
        library_id = ?,
        seat_no = ?,
        first_name = ?,
        last_name = ?,
        father_name = ?,
        age = ?,
        contact = ?,
        address = ?,
        goal = ?,
        membership_plan = ?,
        exam_targeting = ?,
        other_info = ?,
        start_date = ?,
        due_date = ?,
        reminder_date = ?,
        account_status = ?
    WHERE library_id = ?
    `;

    const values = [
        data.library_id,
        data.seat_no,
        data.first_name,
        data.last_name,
        data.father_name,
        data.age,
        data.contact,
        data.address,
        data.goal,
        data.membership_plan,
        data.exam_targeting,
        data.other_info,
        data.start_date,
        data.due_date,
        data.reminder_date,
        data.account_status,
        library_id
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send("Error");
        } else {
            res.send("Member Updated");
        }

    });

});


// DELETE MEMBER
app.delete("/delete-member/:library_id", (req, res) => {

    const library_id = req.params.library_id;

    db.query("DELETE FROM members WHERE library_id = ?", [library_id], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send("Error");
        } else {
            res.send("Member Deleted");
        }

    });

});


// SEAT STATUS — manual override (for seats not tied to a member)
app.post("/seat-status", (req, res) => {
    const { seat_no, status } = req.body;

    if (!seat_no || !['available', 'occupied'].includes(status)) {
        return res.status(400).send("Invalid seat_no or status");
    }

    if (status === 'available') {
        // Remove manual override — seat goes back to being free
        db.query("DELETE FROM seats WHERE seat_no = ?", [seat_no], (err) => {
            if (err) { console.log(err); return res.status(500).send("Error"); }
            res.send("Seat marked available");
        });
    } else {
        // Insert or update manual occupied flag
        db.query(
            "INSERT INTO seats (seat_no, status) VALUES (?, 'occupied') ON DUPLICATE KEY UPDATE status = 'occupied'",
            [seat_no],
            (err) => {
                if (err) { console.log(err); return res.status(500).send("Error"); }
                res.send("Seat marked occupied");
            }
        );
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});