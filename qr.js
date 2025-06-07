const PastebinAPI = require('pastebin-js'),
    pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL') // Keep your Pastebin API key
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    makeWASocket, // Directly importing makeWASocket
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
    makeInMemoryStore,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, {
        recursive: true,
        force: true
    })
};
const {
    readFile
} = require("node:fs/promises")

router.get('/', async (req, res) => {
    const id = makeid();
    async function ERNEST_BOT_QR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id)
        try {
            let qrSock = makeWASocket({ // Using makeWASocket directly and renamed variable to qrSock
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Desktop"),
            });

            qrSock.ev.on('creds.update', saveCreds)
            qrSock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                if (qr) {
                    if (!res.headersSent) {
                        await res.end(await QRCode.toBuffer(qr));
                    }
                }
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    // Send the session ID to the bot's own number
                    let sessionMessage = await qrSock.sendMessage(qrSock.user.id, { text: `WHATSAPP_SESSION="${b64data}"` });

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
_https://chat.whatsapp.com/FAJjIZY3a09Ck73ydqMs4E_

🛠️ Tutorials, Code, and Updates always dropping.

─────────────✧─────────────
👑 STAY REAL. STAY CODED.
`

                    await qrSock.sendMessage(qrSock.user.id, { text: ERNEST_V2_TEXT }, { quoted: sessionMessage })

                    await delay(100);
                    await qrSock.ws.close();
                    return await removeFile("temp/" + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    ERNEST_BOT_QR_CODE();
                }
            });
        } catch (err) {
            if (!res.headersSent) {
                await res.json({
                    code: "Service is Currently Unavailable"
                });
            }
            console.log(err);
            await removeFile("temp/" + id);
        }
    }
    return await ERNEST_BOT_QR_CODE()
});
module.exports = router