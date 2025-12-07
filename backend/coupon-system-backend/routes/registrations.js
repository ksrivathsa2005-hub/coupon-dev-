// routes/registrations.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(16).toString('hex');

// 1. REGISTER STUDENT (Auto-assigns Random Slot)
router.post('/', async (req, res) => {
    const { student_id, event_id } = req.body;

    try {
        // A. Check if Registration Exists
        const check = await db.query(
            'SELECT * FROM registrations WHERE student_id = $1 AND event_id = $2',
            [student_id, event_id]
        );

        // --- NEW LOGIC START ---
        if (check.rows.length > 0) {
            const existingReg = check.rows[0];

            // If they already ate, DO NOT show the QR again
            if (existingReg.status === 'served') {
                return res.status(400).json({ 
                    error: "Coupon already redeemed. You have been served.",
                    isRedeemed: true 
                });
            }

            // If they are registered but haven't eaten, SHOW the existing QR
            return res.status(200).json({
                message: "Existing registration retrieved",
                data: existingReg 
            });
        }
        // --- NEW LOGIC END ---

        // B. Find ANY valid slot for this event (No changes below)
        const slots = await db.query(
            'SELECT slot_id FROM event_slots WHERE event_id = $1',
            [event_id]
        );

        if (slots.rows.length === 0) {
            return res.status(404).json({ error: "No slots defined. Admin must add a slot first." });
        }

        // C. Randomly pick one slot
        const randomSlot = slots.rows[Math.floor(Math.random() * slots.rows.length)];
        
        // D. Create Registration
        const token = generateToken();
        const newReg = await db.query(
            `INSERT INTO registrations (student_id, event_id, slot_id, qr_token, status)
             VALUES ($1, $2, $3, $4, 'registered')
             RETURNING registration_id, qr_token, status`,
            [student_id, event_id, randomSlot.slot_id, token]
        );

        res.status(201).json({
            message: "Registration successful",
            data: newReg.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// 2. SCAN QR CODE (Volunteer Action)
router.post('/scan', async (req, res) => {
    const { qr_token, volunteer_id } = req.body;

    try {
        // A. Find Registration
        const reg = await db.query('SELECT * FROM registrations WHERE qr_token = $1', [qr_token]);
        
        if (reg.rows.length === 0) return res.status(404).json({ error: "Invalid QR Token" });

        const registration = reg.rows[0];

        // B. Check Status
        if (registration.status === 'served') return res.status(400).json({ error: "Student already served" });
        if (registration.status === 'cancelled') return res.status(400).json({ error: "Registration cancelled" });

        // C. Update Status
        await db.query(
            "UPDATE registrations SET status = 'served', served_at = NOW() WHERE registration_id = $1",
            [registration.registration_id]
        );

        // D. Audit Log
        await db.query(
            `INSERT INTO volunteer_actions (volunteer_id, registration_id, action) VALUES ($1, $2, 'scan')`,
            [volunteer_id, registration.registration_id]
        );

        res.json({ message: "Scan successful", student_id: registration.student_id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;