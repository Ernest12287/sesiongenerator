const express = require('express');
const app = express();
const __path = process.cwd(); // Using const for consistency and best practice
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

// Body-parser middleware should generally come before your routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let server = require('./qr'); // This handles the /qr route, which serves the QR code itself
let code = require('./pair'); // This handles the /code endpoint for pair code generation

require('events').EventEmitter.defaultMaxListeners = 500; // Increase event listener limit, good for many connections

app.use('/qr', server); // Mounts the qr.js router under /qr (for serving the QR image/data)
app.use('/code', code); // Mounts the pair.js router under /code (for providing the pair code data)

// Serve the HTML files
app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html'); // Serves your pair code HTML page
});
app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/index.html'); // Serves your main control panel HTML page
});

app.listen(PORT, () => {
    console.log(`
Ernest V2 Session Generator is live:)
Server running on http://localhost:` + PORT);
});

module.exports = app;