// routes/events.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. GET ALL EVENTS
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events ORDER BY date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// 2. CREATE EVENT (Admin)
router.post('/', async (req, res) => {
    const { name, description, date, status } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO events (name, description, date, status) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, description, date, status || 'active']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// 3. CLOSE / UPDATE EVENT (Admin)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, date, status } = req.body;
    try {
        const result = await db.query(
            `UPDATE events 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 date = COALESCE($3, date),
                 status = COALESCE($4, status)
             WHERE event_id = $5 RETURNING *`,
            [name, description, date, status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Event not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// 4. CREATE SLOT (Crucial for the "Random Logic" to work)
router.post('/:id/slots', async (req, res) => {
    const { id } = req.params;
    const { floor, counter, capacity, time_start, time_end } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO event_slots (event_id, floor, counter, capacity, time_start, time_end) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, floor, counter, capacity, time_start, time_end]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get('/active', async (req, res) => {
    // We expect the student_id to be passed as a query parameter
    // Example: GET /events/active?student_id=1
    const studentId = req.query.student_id;

    try {
        let query;
        let params = [];

        if (studentId) {
            // --- SMART QUERY ---
            // If we know the student, check if they are registered and get their slot details
            query = `
                SELECT 
                    e.*, 
                    r.registration_id,
                    r.status as registration_status,
                    s.floor,
                    s.counter,
                    s.time_start,
                    s.time_end
                FROM events e
                LEFT JOIN registrations r ON e.event_id = r.event_id AND r.student_id = $1
                LEFT JOIN event_slots s ON r.slot_id = s.slot_id
                WHERE e.status = 'active' AND e.date >= CURRENT_DATE
                ORDER BY e.date ASC
            `;
            params = [studentId];
        } else {
            // --- BASIC QUERY ---
            // If no student_id, just return plain events (fallback)
            query = `
                SELECT * FROM events 
                WHERE status = 'active' AND e.date >= CURRENT_DATE 
                ORDER BY date ASC
            `;
        }

        const result = await db.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
module.exports = router;