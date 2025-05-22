const PastebinAPI = require('pastebin-js'),
	pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: France_King,
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
	async function FLASH_MD_QR_CODE() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState('./temp/' + id)
		try {
			let Qr_Code_By_France_King = France_King({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: Browsers.macOS("Desktop"),
			});

			Qr_Code_By_France_King.ev.on('creds.update', saveCreds)
			Qr_Code_By_France_King.ev.on("connection.update", async (s) => {
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
					let session = await Qr_Code_By_France_King.sendMessage(Qr_Code_By_France_King.user.id, { text: '' + b64data });
					let FLASH_MD_TEXT = `
╔═══════════════✧═══════════════╗
   💎 𝗧𝗛𝗔𝗡𝗞 𝗬𝗢𝗨 𝗙𝗢𝗥 𝗖𝗛𝗢𝗢𝗦𝗜𝗡𝗚 𝗘𝗥𝗡𝗘𝗦𝗧 𝗩𝟮 💎
╚═══════════════✧═══════════════╝

🚀 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬: Ernest Tech House
🧠 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗘𝗗 𝗪𝗜𝗧𝗛: WhatsApp Bot Framework
💼 𝗠𝗔𝗗𝗘 𝗙𝗢𝗥: Developers, Hustlers, and Legends

🔧 𝗬𝗢𝗨𝗥 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗜𝗦 𝗥𝗘𝗔𝗗𝗬 🔧
📦 Paste this key into your .env to start running the bot.

📲 Need help or support?
🧭 Join the WhatsApp Dev Channel now:
_https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r_

🛠️ Tutorials, Code, and Updates always dropping.

─────────────✧─────────────
👑 STAY REAL. STAY CODED.
`

					await Qr_Code_By_France_King.sendMessage(Qr_Code_By_France_King.user.id, { text: FLASH_MD_TEXT }, { quoted: session })



					await delay(100);
					await Qr_Code_By_France_King.ws.close();
					return await removeFile("temp/" + id);
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					FLASH_MD_QR_CODE();
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
	return await FLASH_MD_QR_CODE()
});
module.exports = router
