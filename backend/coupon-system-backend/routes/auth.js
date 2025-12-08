// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_this";

// Helper: Extract Batch
const extractBatch = (email) => {
    try {
        const localPart = email.split('@')[0];
        const match = localPart.match(/[a-z]+(\d{2})[a-z]+\d+/i);
        if (match && match[1]) {
            return "20" + match[1];
        }
        return null;
    } catch (err) {
        return null;
    }
};

router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        let googleEmail, googleName;

        // ---------------------------------------------------------
        // 1. CHECK TOKEN TYPE
        // ---------------------------------------------------------
        if (token.startsWith("TEST_MODE_")) {
            // A. BYPASS MODE (For Insomnia Testing)
            console.log("⚠️ USING DEV BYPASS MODE");
            googleEmail = token.replace("TEST_MODE_", ""); 
            googleName = "Test User";
            
        } else {
            // B. REAL MODE (For Frontend)
            // 🔴 IMPORTANT: This MUST be in an 'else' block!
            // If this runs on a TEST_MODE token, it will crash.
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID, 
            });
            const payload = ticket.getPayload();
            googleEmail = payload.email;
            googleName = payload.name;
        }

        // ---------------------------------------------------------
        // 2. LOGIC (Common for both modes)
        // ---------------------------------------------------------

        // Domain Check
        if (!googleEmail.endsWith('@iiitkottayam.ac.in')) {
            return res.status(403).json({ 
                error: "Access Restricted. Please login with your IIIT Kottayam email." 
            });
        }

        // Check DB
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [googleEmail]);
        let user = userResult.rows[0];

        // Auto-Signup
        if (!user) {
            console.log(`Creating new user for ${googleEmail}...`);
            let batch = extractBatch(googleEmail);
            
            const newUser = await db.query(
                `INSERT INTO users (name, email, role, batch) 
                 VALUES ($1, $2, 'student', $3) RETURNING *`,
                [googleName, googleEmail, batch]
            );
            user = newUser.rows[0];
        }

        // Generate Token
        const appToken = jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role, 
                email: user.email,
                batch: user.batch 
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: "Login successful",
            token: appToken,
            user: user
        });

    } catch (err) {
        console.error("Auth Error:", err);
        // This is what you were seeing in the logs
        res.status(401).json({ error: "Invalid Token" });
    }
});

module.exports = router;