const PastebinAPI = require('pastebin-js'),
    pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL'); // Keep your API key
const { makeid } = require('./id'); // Assuming './id' exists and has makeid
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: Ernest_Bot,
    useMultiFileAuthState,
    delay,
    Browsers,
} = require("@whiskeysockets/baileys"); // Updated import path

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, {
        recursive: true,
        force: true
    });
}

router.get('/', async (req, res) => {
    const id = makeid();
    async function ERN_QR_CODE() { // Renamed function
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Ernest_Qr_Code_Generator = Ernest_Bot({ // Renamed variable
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Desktop"),
            });

            Ernest_Qr_Code_Generator.ev.on('creds.update', saveCreds);
            Ernest_Qr_Code_Generator.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                if (qr) await res.end(await QRCode.toBuffer(qr));
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Ernest_Qr_Code_Generator.sendMessage(Ernest_Qr_Code_Generator.user.id, { text: "" + b64data });

                    let ERNEST_WELCOME_MESSAGE = `
┏━━━━━━━━━━━━━━━━━━━
┃ Thank you for choosing Ernest Bots!
┃ This session ID can be used for 2 bots:
┃ ErnestV2 and Ernest Phantom.
┃ Join the channel for more updates!
┗━━━━━━━━━━━━━━━━━━━
🔗 WhatsApp Channel: https://whatsapp.com/channel/0029VayK4ty7DAWr0jeCZx0i
`;
                    await Ernest_Qr_Code_Generator.sendMessage(Ernest_Qr_Code_Generator.user.id, { text: ERNEST_WELCOME_MESSAGE }, { quoted: session });

                    await delay(100);
                    await Ernest_Qr_Code_Generator.ws.close();
                    return await removeFile("temp/" + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    ERN_QR_CODE(); // Call the renamed function
                }
            });
        } catch (err) {
            if (!res.headersSent) {
                await res.json({
                    code: "Service Unavailable"
                });
            }
            console.error("Error in QR code generation:", err); // Use console.error for errors
            await removeFile("temp/" + id);
        }
    }
    return await ERN_QR_CODE(); // Call the renamed function
});

module.exports = router;