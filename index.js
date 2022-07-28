const https = require("https");
const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.static('.'));

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443);