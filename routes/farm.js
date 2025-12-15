const express = require('express');
const db = require('../config/db');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Add cattle
router.post('/add-cattle', isLoggedIn, (req, res) => {
    const { cattle_name, breed, age, weight, status } = req.body;
    const user_id = req.session.userId;

    db.query(
        'INSERT INTO cattle SET ?',
        {
            user_id: user_id,
            cattle_name: cattle_name,
            breed: breed,
            age: age,
            weight: weight,
            status: status
        },
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error adding cattle' });
            }
            res.status(201).json({ message: 'Cattle added successfully', id: results.insertId });
        }
    );
});

// Get all cattle for user
router.get('/cattle', isLoggedIn, (req, res) => {
    const user_id = req.session.userId;

    db.query(
        'SELECT * FROM cattle WHERE user_id = ?',
        [user_id],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error fetching cattle' });
            }
            res.json(results);
        }
    );
});

// Add milk record
router.post('/add-milk-record', isLoggedIn, (req, res) => {
    const { cattle_id, quantity, date_recorded, time_recorded, quality } = req.body;
    const user_id = req.session.userId;

    db.query(
        'INSERT INTO milk_records SET ?',
        {
            cattle_id: cattle_id,
            user_id: user_id,
            quantity: quantity,
            date_recorded: date_recorded,
            time_recorded: time_recorded,
            quality: quality
        },
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error adding milk record' });
            }
            res.status(201).json({ message: 'Milk record added successfully' });
        }
    );
});

// Get milk records
router.get('/milk-records', isLoggedIn, (req, res) => {
    const user_id = req.session.userId;

    db.query(
        'SELECT mr.*, c.cattle_name FROM milk_records mr JOIN cattle c ON mr.cattle_id = c.id WHERE mr.user_id = ?',
        [user_id],
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error fetching milk records' });
            }
            res.json(results);
        }
    );
});

// Get total milk for a cattle in a date range
router.get('/milk-total', isLoggedIn, (req, res) => {
    const { cattle_id, start_date, end_date } = req.query;
    const user_id = req.session.userId;

    if (!cattle_id || !start_date || !end_date) {
        return res
            .status(400)
            .json({ message: 'cattle_id, start_date and end_date are required' });
    }

    const sql = `
        SELECT SUM(quantity) AS total_quantity
        FROM milk_records
        WHERE user_id = ?
          AND cattle_id = ?
          AND date_recorded BETWEEN ? AND ?
    `;

    db.query(sql, [user_id, cattle_id, start_date, end_date], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error calculating total milk' });
        }
        const total = results[0].total_quantity || 0;
        res.json({ total_quantity: total });
    });
});

module.exports = router;
