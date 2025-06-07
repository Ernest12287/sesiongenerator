const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL') // Keep your Pastebin API key
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    makeWASocket, // Directly importing makeWASocket
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
};

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
        async function ERNEST_BOT_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/'+id)
       try {
            let pairSock = makeWASocket({ // Using makeWASocket directly and renamed variable to pairSock
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS('Desktop')
            });
             if(!pairSock.authState.creds.registered) { // Using pairSock here
                await delay(1500);
                        num = num.replace(/[^0-9]/g,'');
                            const code = await pairSock.requestPairingCode(num) // Using pairSock here
                     if(!res.headersSent){
                     await res.send({code});
                        }
                    }
            pairSock.ev.on('creds.update', saveCreds)
            pairSock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;
                if (connection == "open") {
                await delay(5000);
                let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                await delay(800);
                let b64data = Buffer.from(data).toString('base64');
                // Send the session ID to the bot's own number
                let sessionMessage = await pairSock.sendMessage(pairSock.user.id, { text: `WHATSAPP_SESSION="${b64data}"` });

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
`

    await pairSock.sendMessage(pairSock.user.id,{text:ERNEST_V2_TEXT},{quoted:sessionMessage})


        await delay(100);
        await pairSock.ws.close();
        return await removeFile('./temp/'+id);
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                        await delay(10000);
                        ERNEST_BOT_PAIR_CODE();
                    }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/'+id);
           if(!res.headersSent){
             await res.send({code:"Service is Currently Unavailable"});
           }
        }
    }
    return await ERNEST_BOT_PAIR_CODE()
});
module.exports = router