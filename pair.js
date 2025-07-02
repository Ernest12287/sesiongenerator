// pairRoute.js

const PastebinAPI = require('pastebin-js');
// The API key below is exposed in the public code. Consider loading it from .env or securing it if this is a public repository.
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');

const { makeid } = require('./id'); // Assuming id.js exports a makeid function
const express = require('express');
const fs = require('fs');
let router = express.Router(); // This router will handle the /pair requests
const pino = require("pino");
const { Boom } = require('@hapi/boom');

const {
    default: Ernest_Bot, // Renamed from makeWASocket for clarity as per your usage
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers, // Browsers is imported but the specific line causing the issue is now fully removed
    DisconnectReason,
} = require("@whiskeysockets/baileys");

// Helper function to remove session files
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
    console.log(`[WA DEBUG] Removed session files for: ${FilePath}`);
};

// Define the GET route for pairing
router.get('/', async (req, res) => {
    const id = makeid(); // Generate a unique ID for the session folder
    let num = req.query.number; // Get the phone number from query parameters

    console.log(`[WA DEBUG] Received pairing request for number: ${num}, temporary ID: ${id}`);

    // Validate phone number presence
    if (!num) {
        if (!res.headersSent) {
            return res.status(400).send({ error: "Phone number is required as a query parameter (e.g., ?number=2547XXXXXXXX)." });
        }
        return;
    }

    // Sanitize phone number (remove non-digits)
    num = num.replace(/[^0-9]/g, '');

    // Validate phone number after sanitization
    if (!num) {
        if (!res.headersSent) {
            return res.status(400).send({ error: "Invalid phone number provided after cleaning. Please provide a valid number." });
        }
        return;
    }

    const sessionPath = `./temp/${id}`; // Path for temporary session files
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
        console.log(`[WA DEBUG] Created temporary session directory: ${sessionPath}`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    let sock;
    let codeSentToClient = false; // Flag to ensure response is sent only once

    // Function to start or restart the ephemeral (temporary) WhatsApp session
    const startEphemeralSession = async () => {
        sock = Ernest_Bot({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false, // Prevents QR code from printing in the terminal
            logger: pino({ level: "debug" }), // Set logger to DEBUG level for detailed logs
            // The 'browser' property is intentionally omitted here to allow Baileys to default
            // to a setting that typically yields the hyphenated pairing code (XXXX-YYYY).
            // This was a key issue in previous attempts resulting in 8-character codes.
            // If you still face issues with the code format, you might try:
            // browser: ['Chrome', 'Desktop'],
            // or
            // browser: ['MacOS', 'Desktop'],
            // defaultQueryTimeoutMs: 0 // Uncomment this if timeouts are still an issue
        });
        console.log(`[WA DEBUG] Baileys socket initialized (or re-initialized) for ${num} with temporary ID ${id}.`);

        // Save credentials when they update
        sock.ev.on('creds.update', saveCreds);

        // Handle connection updates
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'connecting') {
                console.log(`[WA DEBUG] WhatsApp session for ${num} (ID: ${id}) is connecting...`);
                // If not yet registered and code hasn't been sent, request pairing code
                if (!sock.authState.creds.registered && !codeSentToClient) {
                    try {
                        await delay(2000); // Small delay before requesting code
                        console.log(`[WA DEBUG] Requesting pairing code for ${num}...`);
                        const code = await sock.requestPairingCode(num); // Request the code
                        
                        if (!res.headersSent) { // Ensure headers haven't been sent already
                            res.send({
                                code,
                                message: "Enter this code in your WhatsApp Linked Devices > Link with phone number instead."
                            });
                            codeSentToClient = true; // Set flag
                            console.log(`[WA DEBUG] Sent pairing code to client: ${code}`);
                        }
                    } catch (error) {
                        console.error(`[WA DEBUG] Failed to request pairing code for ${num} (ID: ${id}):`, error);
                        if (!res.headersSent) {
                            res.status(500).send({ error: "Failed to get pairing code.", details: error.message });
                        }
                        // Close socket and remove files on error
                        if (sock.ws && sock.ws.readyState === sock.ws.OPEN) {
                            sock.ws.close();
                        }
                        removeFile(sessionPath);
                    }
                } else if (sock.authState.creds.registered) {
                    console.log(`[WA DEBUG] Session for ${num} (ID: ${id}) is already registered. Waiting for connection to open.`);
                    if(!res.headersSent){
                        // If session is registered but response not sent yet, inform client
                        res.send({ message: "Session already exists for this number. Waiting for connection to open." });
                    }
                }
            } else if (connection === "open") {
                console.log(`[WA DEBUG] Temporary session for ${num} (ID: ${id}) is OPEN!`);
                await delay(10000); // Wait 10 seconds after open to ensure session stability

                let data;
                try {
                    // Read the session credentials file
                    data = fs.readFileSync(`${sessionPath}/creds.json`);
                } catch (readErr) {
                    console.error(`[WA DEBUG] Error reading creds.json for ${num} (ID: ${id}):`, readErr);
                    if (sock.ws && sock.ws.readyState === sock.ws.OPEN) {
                        sock.ws.close();
                    }
                    removeFile(sessionPath);
                    return;
                }

                await delay(800);
                let b64data = Buffer.from(data).toString('base64'); // Convert credentials to base64

                console.log(`[WA DEBUG] Sending base64 creds to ${num} via WhatsApp message (ID: ${id}).`);
                try {
                    // Send the base64 creds to the connected WhatsApp number
                    await sock.sendMessage(sock.user.id, { text: `YOUR_BAILEYS_SESSION_CREDS:\n\n` + b64data });

                    // Send a welcome message with channel links
                    let ERNEST_WELCOME_MESSAGE = `
┏━━━━━━━━━━━━━━━━━━━
┃ Thank you for choosing Ernest Bots!
┃ This session ID can be used for 2 bots:
┃ ErnestV2 and Ernest Phantom.
┃ Join the channel for more updates!
┗━━━━━━━━━━━━━━━━━━━
🔗 WhatsApp Channel: https://whatsapp.com/channel/0029VayK4ty7DAWr0jeCZx0i
`;
                    await sock.sendMessage(sock.user.id, { text: ERNEST_WELCOME_MESSAGE });
                    console.log(`[WA DEBUG] Sent welcome message to ${num} (ID: ${id}).`);
                } catch (sendError) {
                    console.error(`[WA DEBUG] Failed to send creds/welcome message to ${num} (ID: ${id}):`, sendError.message);
                }

                // *** CRITICAL CHANGE: Removed premature session close and file deletion here. ***
                // The session needs to stay alive to receive the 'restartRequired' event after pairing.
                // Cleanup and reconnection logic is now handled correctly in the 'close' event.

            } else if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.error(`[WA DEBUG] Connection closed for ${num} (ID: ${id}). Reason:`, DisconnectReason[reason] || reason, lastDisconnect?.error);

                // Reconnect/cleanup logic based on disconnect reason and registration status
                if (reason === DisconnectReason.loggedOut) {
                    // Logged out means credentials are no longer valid, so clean up.
                    console.log(`[WA DEBUG] Logged out for ${num} (ID: ${id}). Deleting temporary session data.`);
                    removeFile(sessionPath);
                } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.restartRequired) {
                    // These reasons imply a temporary disconnect or a successful pairing followed by a restart signal.
                    // If credentials are now registered, it means pairing was successful, and we should reconnect.
                    if (sock.authState.creds.registered) {
                        console.log(`[WA DEBUG] Connection closed/Restart required for ${num} (ID: ${id}), but session registered. Attempting to reconnect.`);
                        // Ensure the socket is properly closed before attempting to re-initialize
                        if (sock.ws && sock.ws.readyState === sock.ws.OPEN) {
                            sock.ws.close();
                        }
                        // Re-initialize the session (this will use the saved creds to establish a persistent connection)
                        setTimeout(() => startEphemeralSession(), 5000); // Wait 5 seconds before retrying
                    } else {
                        // If not registered and restartRequired, this is the initial pairing phase retry
                        console.log(`[WA DEBUG] Restart required for ${num} (ID: ${id}). Not yet registered. Attempting to re-initiate ephemeral session.`);
                        if (sock.ws && sock.ws.readyState === sock.ws.OPEN) {
                            sock.ws.close();
                        }
                        // Re-initialize the session to try pairing again
                        setTimeout(() => startEphemeralSession(), 5000);
                    }
                } else {
                    // For any other unhandled disconnect reason (e.g., forbidden, conflict, blocked)
                    console.log(`[WA DEBUG] Unhandled disconnect reason for ${num} (ID: ${id}): ${DisconnectReason[reason] || reason}. Cleaning up.`);
                    // Clean up if not registered, or if specific critical errors (forbidden/rate limit) occur
                    if (!sock.authState.creds.registered || reason === DisconnectReason.forbidden || reason === 423 || reason === 429) {
                        removeFile(sessionPath);
                    }
                    if (sock.ws && sock.ws.readyState === sock.ws.OPEN) {
                        sock.ws.close();
                    }
                    // If the connection closed before sending the pairing code AND no response was sent, send a service unavailable message
                    if (!res.headersSent && !codeSentToClient && !sock.authState.creds.registered) {
                        res.status(503).send({ code: "Service Unavailable", details: DisconnectReason[reason] || reason });
                    }
                }
            }
        });
    }; // End of startEphemeralSession function definition

    // Initial call to start the ephemeral session
    try {
        await startEphemeralSession();
    } catch (err) {
        console.error(`[WA DEBUG] Initial session start failed for ${num} (ID: ${id}):`, err);
        if (!res.headersSent) {
            res.status(500).send({ error: "Failed to initialize WhatsApp connection.", details: err.message });
        }
        // Clean up on initial failure
        if (sessionPath && fs.existsSync(sessionPath)) {
            removeFile(sessionPath);
        }
        if (sock && sock.ws && sock.ws.readyState === sock.ws.OPEN) {
            sock.ws.close();
        }
    }
});

module.exports = router;