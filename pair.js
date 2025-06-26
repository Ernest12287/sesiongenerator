const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: Ernest_Bot, // Renamed from Maher_Zubair
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys"); // Corrected import path

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
};
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
        async function ERN_PAIR_CODE() { // Renamed from SIGMA_MD_PAIR_CODE
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/'+id)
      try {
            let Ernest_Pair_Code_Generator = Ernest_Bot({ // Renamed from Pair_Code_By_Maher_Zubair
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: ["Chrome (Linux)", "", ""] // Kept original browser setting from your first code
              });
            if(!Ernest_Pair_Code_Generator.authState.creds.registered) {
                await delay(1500);
                        num = num.replace(/[^0-9]/g,'');
                            const code = await Ernest_Pair_Code_Generator.requestPairingCode(num)
                    if(!res.headersSent){
                    await res.send({code});
                        }
                    }
            Ernest_Pair_Code_Generator.ev.on('creds.update', saveCreds)
            Ernest_Pair_Code_Generator.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;
                if (connection == "open") {
                await delay(5000);
                let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                await delay(800);
                let b64data = Buffer.from(data).toString('base64');
                let session = await Ernest_Pair_Code_Generator.sendMessage(Ernest_Pair_Code_Generator.user.id, { text: "" + b64data });

                let ERNEST_WELCOME_MESSAGE = `
┏━━━━━━━━━━━━━━━━━━━
┃ Thank you for choosing Ernest Bots!
┃ This session ID can be used for 2 bots:
┃ ErnestV2 and Ernest Phantom.
┃ Join the channel for more updates!
┗━━━━━━━━━━━━━━━━━━━
🔗 WhatsApp Channel: https://whatsapp.com/channel/0029VayK4ty7DAWr0jeCZx0i
`; // Updated welcome message
    await Ernest_Pair_Code_Generator.sendMessage(Ernest_Pair_Code_Generator.user.id,{text:ERNEST_WELCOME_MESSAGE},{quoted:session})
    
        await delay(100);
        await Ernest_Pair_Code_Generator.ws.close();
        return await removeFile('./temp/'+id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                        await delay(10000);
                        ERN_PAIR_CODE(); // Call the renamed function
                    }
            });
        } catch (err) {
            console.log("Error in ERN_PAIR_CODE, service restated:", err); // Improved log for debugging
            await removeFile('./temp/'+id);
            if(!res.headersSent){
                await res.send({code:"Service Unavailable"});
            }
        }
    }
    return await ERN_PAIR_CODE()
});
module.exports = router