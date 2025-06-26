const express = require('express');
const app = express();
const path = require('path'); // Added path module explicitly
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

// Ensure __path is correctly defined for file serving
const __path = process.cwd();

let qrRoute = require('./qr'); // Renamed to qrRoute for clarity
let pairRoute = require('./pair'); // Renamed to pairRoute for clarity

require('events').EventEmitter.defaultMaxListeners = 500;

// Use body-parser middleware before routes that might need it
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (if any, though not explicitly in original)
// If you have CSS, JS, or image files, you'll need to serve them.
// For now, assuming pair.html and index.html are served directly.
// Example: app.use(express.static(path.join(__path, 'public')));

app.use('/qr', qrRoute);
app.use('/code', pairRoute); // Assuming '/code' is used for pair code generation
app.use('/pair', async (req, res, next) => {
    res.sendFile(path.join(__path, 'pair.html')); // Use path.join for robustness
});
app.use('/', async (req, res, next) => {
    res.sendFile(path.join(__path, 'index.html')); // Use path.join for robustness
});

app.listen(PORT, () => {
    console.log(`
🚀 Ernest Tech House Bot Session ID Generator is running!
Access it at: http://localhost:${PORT}
`);
});

module.exports = app;