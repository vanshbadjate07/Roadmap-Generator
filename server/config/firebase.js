const admin = require('firebase-admin');
require('dotenv').config();

// Check if service account key is provided via env var or file
// For MVP/Replit, environment variable with JSON string is best
// Check if service account key is provided via env var or file
// For MVP/Replit, environment variable with JSON string is best
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();

    // Sanitize: formatting issues sometimes add quotes around the JSON
    if (keyString.startsWith("'") && keyString.endsWith("'")) {
        keyString = keyString.slice(1, -1);
    } else if (keyString.startsWith('"') && keyString.endsWith('"')) {
        keyString = keyString.slice(1, -1);
    }

    try {
        serviceAccount = JSON.parse(keyString);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
    }
} else {
    serviceAccount = null;
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id // Explicitly set from key
    });
} else {
    // Check for default credentials (e.g. valid on GCP) or warn
    console.warn("No FIREBASE_SERVICE_ACCOUNT_KEY found. Firestore may not work.");
    // Initialize without creds to allow auto-discovery or fail gracefully later
    admin.initializeApp();
}

const db = admin.firestore();

module.exports = { admin, db };
