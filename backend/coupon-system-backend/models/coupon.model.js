const pool = require("../db/pgsql");

const couponModel = async () => {
    try {
        await pool.query(`
            -- google id that we got from google oauth
            CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            google_id text UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL CHECK (email LIKE '%@iiitkottayam.ac.in'),
            role VARCHAR(20) NOT NULL CHECK (role IN ('student','admin','volunteer')),
            batch VARCHAR(20), -- only for students
            created_at TIMESTAMP DEFAULT NOW()
);
            -- which volunteer is assigned to which slots (volunteer id needed)
            CREATE TABLE IF NOT EXISTS slots(
            slot_id SERIAL PRIMARY KEY,
            event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
            floor INT NOT NULL,
            volunteer_id INT REFERENCES volunteers(id) ON DELETE SET NULL,
            time_start TIME NOT NULL,
            time_end TIME NOT NULL,
            counter INT NOT NULL,
            capacity INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

            CREATE TABLE IF NOT EXISTS qrcodes(
                id UNIQUE PRIMARY KEY,
                code_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- volunteers table is added to distinguish volunteers from users table
            CREATE TABLE volunteers (
                id SERIAL PRIMARY KEY,
                volunteer_id INT REFERENCES users(user_id),
                registration_id INT REFERENCES registrations(registration_id),
                timestamp TIMESTAMP DEFAULT NOW()
            );

            -- to log volunteer actions like scanning QR codes or marking served
            create TABLE IF NOT EXISTS volunteer_logs (
                log_id SERIAL PRIMARY KEY,
                volunteer_id INT REFERENCES volunteers(id) ON DELETE CASCADE,
                action VARCHAR(50) NOT NULL CHECK (action IN ('scan','mark_served')),
                timestamp TIMESTAMP DEFAULT NOW()
            );
            -- created by only volunteers
            CREATE TABLE events (
            event_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
            created_by INT REFERENCES volunteers(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

            -- on registrations qr_code_id references qrcodes(id)
            CREATE TABLE registrations (
                registration_id SERIAL PRIMARY KEY,
                student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
                slot_id INT REFERENCES event_slots(slot_id) ON DELETE CASCADE,
                qr_code_id INT REFERENCES qrcodes(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered','served','expired')),
                created_at TIMESTAMP DEFAULT NOW(),
                served_at TIMESTAMP
            );
        `);
    } catch (error) {
        console.error("Error creating schema", error);
    }
}

module.exports = couponModel;

