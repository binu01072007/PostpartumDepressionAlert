Aanchal Alert — Postpartum Depression Alert System

Aanchal Alert is a technology-driven postpartum mental health support system designed to help identify early signs of postpartum depression and enable timely wellness support through automated voice communication.

The project combines a responsive web interface, a Node.js backend, and Twilio Voice integration to demonstrate how automated postpartum wellness check-ins can be delivered to new mothers.

Project Overview

Postpartum depression can affect mothers during the weeks and months following childbirth. Early identification and timely support can help connect mothers with appropriate care.

Aanchal Alert demonstrates a simple technology-assisted workflow:

Provide an accessible postpartum mental health interface.
Connect the frontend with a backend API.
Initiate voice communication through Twilio.
Create a foundation for collecting and processing wellness responses.
Enable future integration with healthcare professionals and support systems.

This project is a prototype and is not intended to diagnose, treat, or replace professional medical care.

Key Features
Responsive and accessible web interface
Dedicated postpartum mental health support experience
Automated voice-call integration using Twilio
Node.js and Express backend
REST API for voice-call requests
Backend health-check endpoint
Secure environment-variable based credential handling
CORS-enabled frontend and backend communication
Clean separation between frontend and backend
Scalable foundation for future healthcare integrations
Technology Stack

Frontend

HTML5
CSS3
JavaScript

Backend

Node.js
Express.js
CORS
dotenv

Voice Communication

Twilio Voice API

Deployment & Version Control

Vercel
Git
GitHub
Project Structure
PostpartumDepressionAlert/
│
├── index.html
├── styles.css
├── script.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
Backend API
Health Check
GET /api/health

Returns the current health status of the backend.

Example:

{
  "status": "ok",
  "message": "Backend is healthy"
}
Voice Call
POST /api/call

Initiates a voice-call request through the Twilio integration.

Example request:

{
  "to": "PHONE_NUMBER"
}

Twilio credentials are loaded through environment variables and are not stored directly in the source code.

Environment Variables

Create a .env file inside the backend directory:

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

The .env file is excluded from GitHub through .gitignore.

Never commit API credentials, authentication tokens, or other secrets to a public repository.

Running Locally
1. Clone the repository
git clone https://github.com/binu01072007/PostpartumDepressionAlert.git
2. Enter the project
cd PostpartumDepressionAlert
3. Install backend dependencies
cd backend
npm install
4. Configure environment variables

Create the .env file inside the backend folder and add your Twilio credentials.

5. Start the backend
node server.js

The backend runs on:

http://localhost:5000
6. Run the frontend

Open index.html in a browser or use a local development server.

Twilio Integration

Aanchal Alert uses Twilio Voice to demonstrate automated voice communication.

The prototype was developed and tested using a Twilio trial account. Trial accounts have limitations on automated calling and certain API functionality.

The current implementation demonstrates the voice integration and provides the foundation for a production calling workflow. Full automated production calling can be enabled after upgrading the Twilio account and deploying the backend to a publicly accessible server.

Deployment
Frontend

The frontend is deployed using Vercel.

Live Demo:
PASTE YOUR VERCEL LINK HERE

Backend

The backend currently runs locally.

For production deployment, the backend can be hosted on a Node.js-compatible platform and connected to the deployed frontend using secure environment variables.

Future Enhancements
Automated postpartum wellness assessments
Voice-based response collection
Multilingual voice interactions
AI-assisted response analysis
Risk-level classification
Healthcare professional notifications
Emergency escalation workflows
SMS follow-up notifications
Patient history and progress tracking
Secure database integration
Authentication and role-based access
Healthcare-provider dashboard
Production monitoring and logging
Important Disclaimer

Aanchal Alert is a technology prototype created to demonstrate an automated postpartum mental health support workflow.

It is not a medical diagnostic system and should not be used as a substitute for professional medical advice, diagnosis, or treatment.

Any real-world healthcare deployment would require clinical validation, appropriate privacy and security controls, regulatory compliance, and involvement of qualified healthcare professionals.

Project Links

GitHub:
https://github.com/binu01072007/PostpartumDepressionAlert

Live Demo:https://postpartumdepressionalert.vercel.app/


Author

Binu
