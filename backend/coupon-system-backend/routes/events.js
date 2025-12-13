// routes/events.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. GET ALL EVENTS (Admin) - With Auto-Close Logic
router.get('/', async (req, res) => {
    try {
        // --- A. AUTO-CLOSE EXPIRED EVENTS ---
        // Sets status to 'closed' if the event is 'active' but the time has passed.
        // We use (CURRENT_TIMESTAMP + 5.5 hours) to match IST if your server is UTC.
        await db.query(`
            UPDATE events
            SET status = 'closed'
            WHERE status = 'active'
            AND event_id IN (
                SELECT event_id FROM event_slots
                GROUP BY event_id
                HAVING MAX(time_end) < (CURRENT_TIMESTAMP + interval '5 hours 30 minutes')
            )
        `);

        // --- B. FETCH THE LIST ---
        const result = await db.query(`
            SELECT e.*, 
                   (SELECT time_start FROM event_slots WHERE event_id = e.event_id LIMIT 1) as time_start,
                   (SELECT time_end FROM event_slots WHERE event_id = e.event_id LIMIT 1) as time_end
            FROM events e 
            ORDER BY date ASC
        `);
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
    let { name, description, date, status, time_start, time_end } = req.body;

    try {
        // 1. Update the Main Event Details
        // The query will now use the 'status' passed from the frontend (which is correct)
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

        // 2. Update the Slots
        if (time_start && time_end) {
            await db.query(
                `UPDATE event_slots 
                 SET time_start = $1, 
                     time_end = $2 
                 WHERE event_id = $3`,
                [time_start, time_end, id]
            );
        }

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
// DELETE EVENT (Hard Delete everything related to it)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Delete Volunteer Actions (Serving Logs) associated with this event's registrations
        // We find all registrations for this event and delete their logs first.
        await db.query(`
            DELETE FROM volunteer_actions 
            WHERE registration_id IN (
                SELECT registration_id FROM registrations WHERE event_id = $1
            )
        `, [id]);

        // 2. Delete Student Registrations
        await db.query('DELETE FROM registrations WHERE event_id = $1', [id]);

        // 3. Delete Event Slots (Time slots & Counters)
        await db.query('DELETE FROM event_slots WHERE event_id = $1', [id]);

        // 4. Finally, Delete the Main Event
        const result = await db.query('DELETE FROM events WHERE event_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event and all related data permanently deleted." });

    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Server error. Could not delete event data." });
    }
});

// GET EVENT STATISTICS
router.get('/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Total Served
        const totalReq = await db.query(`
            SELECT COUNT(*) 
            FROM volunteer_actions va
            JOIN registrations r ON va.registration_id = r.registration_id
            WHERE r.event_id = $1
        `, [id]);

        // 2. Breakdown by Batch (Year)
        const batchReq = await db.query(`
            SELECT u.batch, COUNT(*) as count
            FROM volunteer_actions va
            JOIN registrations r ON va.registration_id = r.registration_id
            JOIN users u ON r.student_id = u.user_id
            WHERE r.event_id = $1
            GROUP BY u.batch
            ORDER BY u.batch ASC
        `, [id]);

        // 3. Breakdown by Counter (Volunteer Name)
        const counterReq = await db.query(`
            SELECT u.name as counter_name, COUNT(*) as count
            FROM volunteer_actions va
            JOIN users u ON va.volunteer_id = u.user_id
            JOIN registrations r ON va.registration_id = r.registration_id
            WHERE r.event_id = $1
            GROUP BY u.name
            ORDER BY u.name ASC
        `, [id]);

        res.json({
            total: parseInt(totalReq.rows[0].count),
            byBatch: batchReq.rows,
            byCounter: counterReq.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching stats" });
    }
});

// routes/events.js

router.get('/active', async (req, res) => {
    const studentId = req.query.student_id;

    try {
        let query;
        let params = [];

        // 👇 FIX: Adjust server time to IST (UTC + 5:30)
        // This ensures the DB compares 3:31 PM against 3:25 PM correctly.
        const expiryCheck = `
            AND EXISTS (
                SELECT 1 FROM event_slots s 
                WHERE s.event_id = e.event_id 
                AND s.time_end > (CURRENT_TIMESTAMP + interval '5 hours 30 minutes')
            )
        `;

        if (studentId) {
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
                WHERE e.status = 'active' 
                ${expiryCheck}
                ORDER BY e.date ASC
            `;
            params = [studentId];
        } else {
            query = `
                SELECT * FROM events e
                WHERE status = 'active' 
                ${expiryCheck}
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