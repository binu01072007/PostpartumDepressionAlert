const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Basic test
app.get("/", (req, res) => {
  res.json({
    message: "Postpartum Depression Alert backend is running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is healthy",
  });
});

// Make a test voice call
app.post("/api/call", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        error: "Phone number is required",
      });
    }

    const call = await client.calls.create({
  to: to,
  from: process.env.TWILIO_PHONE_NUMBER,
  url: "https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech",
});
    res.json({
      success: true,
      message: "Call started",
      callSid: call.sid,
    });
  } catch (error) {
    console.error("Twilio error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});