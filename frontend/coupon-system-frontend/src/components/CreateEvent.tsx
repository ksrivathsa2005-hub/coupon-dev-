import React, { useState } from "react";

type EventPayload = {
  name: string;
  description: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:MM
  endTime: string; // HH:MM
};

const cardStyle: React.CSSProperties = {
  width: 340,
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  background: "#fff",
  fontFamily:
    'Segoe UI, Roboto, system-ui, -apple-system, "Helvetica Neue", Arial',
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  marginBottom: 14,
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  background: "#4caf50",
  color: "white",
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
};

export default function CreateEvent() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return "Event name is required";
    if (!date) return "Event date is required";
    if (!startTime) return "Start time is required";
    if (!endTime) return "End time is required";
    // ensure end is after start when on same day
    if (startTime && endTime) {
      const s = startTime.split(":").map(Number);
      const e = endTime.split(":").map(Number);
      if (e[0] < s[0] || (e[0] === s[0] && e[1] <= s[1]))
        return "End time must be later than start time";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }

    const payload: EventPayload = {
      name: name.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
    };

    try {
      setSubmitting(true);
      // Placeholder: send to server. Replace URL with your API endpoint.
      // await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      console.log("CreateEvent payload:", payload);
      setMessage("Event created successfully (demo)");
      // clear form
      setName("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 2, marginBottom: 18 }}>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="eventName">
          Event Name
        </label>
        <input
          id="eventName"
          placeholder="e.g., Onam Special Lunch"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={labelStyle} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Brief description of the event"
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label style={labelStyle} htmlFor="eventDate">
          Event Date
        </label>
        <input
          id="eventDate"
          type="date"
          style={{ ...inputStyle, paddingRight: 36 }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle} htmlFor="startTime">
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              style={inputStyle}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="endTime">
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              style={inputStyle}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <div
            style={{
              margin: "8px 0",
              color:
                message.startsWith("Failed") || message.includes("End time")
                  ? "#b91c1c"
                  : "#064e3b",
            }}
          >
            {message}
          </div>
        )}

        <button type="submit" style={btnStyle} disabled={submitting}>
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
