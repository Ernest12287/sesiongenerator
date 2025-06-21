const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL') // Keep your Pastebin API key
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
};

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    // Validate phone number
    if (!num) {
        return res.status(400).send({ error: "Phone number is required" });
    }
    
    async function ERNEST_BOT_PAIR_CODE() {
        let pairSock;
        
        try {
            const {
                state,
                saveCreds
            } = await useMultiFileAuthState('./temp/'+id)
            
            pairSock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS('Desktop'),
                connectTimeoutMs: 60000, // Increase timeout
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false
            });

            if(!pairSock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g,'');
                
                // Validate cleaned number
                if (num.length < 10) {
                    throw new Error("Invalid phone number format");
                }
                
                const code = await pairSock.requestPairingCode(num);
                
                if(!res.headersSent){
                    return res.send({code});
                }
            }

            pairSock.ev.on('creds.update', saveCreds);
            
            pairSock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                
                if (connection == "open") {
                    try {
                        await delay(5000);
                        
                        // Check if file exists before reading
                        const credsPath = __dirname + `/temp/${id}/creds.json`;
                        if (!fs.existsSync(credsPath)) {
                            throw new Error("Credentials file not found");
                        }
                        
                        let data = fs.readFileSync(credsPath);
                        await delay(800);
                        let b64data = Buffer.from(data).toString('base64');
                        
                        // Send the session ID to the bot's own number
                        let sessionMessage = await pairSock.sendMessage(pairSock.user.id, { 
                            text: `WHATSAPP_SESSION="${b64data}"` 
                        });

                        let ERNEST_V2_TEXT = `
╔═══════════════✧═══════════════╗
   💎 𝗧𝗛𝗔𝗡𝗞 𝗬𝗢𝗨 𝗙𝗢𝗥 𝗖𝗛𝗢𝗢𝗦𝗜𝗡𝗚 𝗘𝗥𝗡𝗘𝗦𝗧 𝗩𝟮 💎
╚═══════════════✧═══════════════╝

🚀 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬: Ernest Tech House
🧠 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗘𝗗 𝗪𝗜𝗧𝗛: WhatsApp Bot Framework
💼 𝗠𝗔𝗗𝗘 𝗙𝗢𝗥: Developers, Hustlers, and Legends

🔧 𝗬𝗢𝗨𝗥 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗜𝗦 𝗥𝗘𝗔𝗗𝗬 🔧
📦 Paste the key above into your .env to start running the bot.

📲 Need help or support?
🧭 Join the WhatsApp Dev Channel now:
_https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r_

🛠️ Tutorials, Code, and Updates always dropping.

─────────────✧─────────────
👑 STAY REAL. STAY CODED.
`;

                        await pairSock.sendMessage(pairSock.user.id, {
                            text: ERNEST_V2_TEXT
                        }, {quoted: sessionMessage});

                        await delay(100);
                        await pairSock.ws.close();
                        return await removeFile('./temp/'+id);
                        
                    } catch (sessionError) {
                        console.log("Session creation error:", sessionError);
                        await pairSock.ws.close();
                        await removeFile('./temp/'+id);
                        
                        if(!res.headersSent){
                            return res.status(500).send({error: "Failed to create session"});
                        }
                    }
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error) {
                    const statusCode = lastDisconnect.error.output?.statusCode;
                    
                    if (statusCode === DisconnectReason.badSession) {
                        console.log("Bad Session File, Please Delete Session and Scan Again");
                        await removeFile('./temp/'+id);
                        
                        if(!res.headersSent){
                            return res.status(400).send({error: "Bad session, please try again"});
                        }
                    } else if (statusCode === DisconnectReason.connectionClosed) {
                        console.log("Connection closed, reconnecting....");
                        await delay(5000);
                        ERNEST_BOT_PAIR_CODE();
                    } else if (statusCode === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server, reconnecting...");
                        await delay(5000);
                        ERNEST_BOT_PAIR_CODE();
                    } else if (statusCode === DisconnectReason.connectionReplaced) {
                        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                        await removeFile('./temp/'+id);
                        
                        if(!res.headersSent){
                            return res.status(409).send({error: "Connection replaced"});
                        }
                    } else if (statusCode === DisconnectReason.loggedOut) {
                        console.log("Device Logged Out, Please Scan Again And Run.");
                        await removeFile('./temp/'+id);
                        
                        if(!res.headersSent){
                            return res.status(401).send({error: "Device logged out"});
                        }
                    } else if (statusCode === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        await delay(5000);
                        ERNEST_BOT_PAIR_CODE();
                    } else if (statusCode === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut, Reconnecting...");
                        await delay(5000);
                        ERNEST_BOT_PAIR_CODE();
                    } else if (statusCode !== 401) {
                        console.log("Unknown DisconnectReason:", statusCode);
                        await delay(10000);
                        ERNEST_BOT_PAIR_CODE();
                    }
                }
            });
            
        } catch (err) {
            console.log("ERNEST_BOT_PAIR_CODE Error:", err.message);
            await removeFile('./temp/'+id);
            
            // Close socket if it exists
            if (pairSock && pairSock.ws) {
                try {
                    await pairSock.ws.close();
                } catch (closeError) {
                    console.log("Error closing socket:", closeError);
                }
            }
            
            if(!res.headersSent){
                return res.status(500).send({
                    error: "Service is Currently Unavailable", 
                    details: err.message
                });
            }
        }
    }
    
    return await ERNEST_BOT_PAIR_CODE();
});

module.exports = router;