const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { isLoggedIn, isNotLoggedIn } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', isNotLoggedIn, (req, res) => {
    const { name, email, password, passwordConfirm, phone, role } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
        return res.status(400).render('register', {
            message: 'Please provide all required fields'
        });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({
            message: 'Passwords do not match'
        });
    }

    // Check if email exists
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        }

        // Hash password
        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword, phone: phone, role: role }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.status(201).json({
                    message: 'User registered successfully'
                });
            }
        });
    });
});

// Login
router.post('/login', isNotLoggedIn, (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Please provide email and password'
        });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Set session
        req.session.userId = results[0].id;
        req.session.user = results[0];

        return res.status(200).json({
            message: 'Login successful',
            userId: results[0].id
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(400).json({ message: 'Logout failed' });
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Check session
router.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;

