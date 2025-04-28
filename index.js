const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
// Configure CORS
const allowedOrigins = [
    'https://listen-like.onrender.com', // Your PRODUCTION Flutter frontend URL
    'https://listen-like.onrender.com/',
    'http://localhost',
    // Add the specific port Flutter web server uses locally if needed
    // 'http://localhost:55363'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) OR
        // allow requests from specified origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocked origin: ${origin}`); // Log blocked origins
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET", // Only allow GET method needed for this API
    // optionsSuccessStatus: 200 // some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    const ping = new Date();
    ping.setHours(ping.getHours() - 3);
    console.log(
        `Ping at: ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
    );
    res.sendStatus(200);
});

app.get("/info", async (req, res) => {
    const { url } = req.query;

    if (url) {
        const isValid = ytdl.validateURL(url);

        if (isValid) {
            const info = (await ytdl.getInfo(url)).videoDetails;

            const title = info.title;
            const thumbnail = info.thumbnails[2].url;

            res.send({ title: title, thumbnail: thumbnail });
        } else {
            res.status(400).send("Invalid url");
        }
    } else {
        res.status(400).send("Invalid query");
    }
});

app.get("/mp3", async (req, res) => {
    const { url } = req.query;

    if (url) {
        const isValid = ytdl.validateURL(url);

        if (isValid) {
            const videoName = (await ytdl.getInfo(url)).videoDetails.title;

            res.header(
                "Content-Disposition",
                `attachment; filename="${videoName}.mp3"`
            );
            res.header("Content-type", "audio/mpeg3");

            ytdl(url, { quality: "highestaudio", format: "mp3" }).pipe(res);
        } else {
            res.status(400).send("Invalid url");
        }
    } else {
        res.status(400).send("Invalid query");
    }
});

app.get("/mp4", async (req, res) => {
    const { url } = req.query;

    if (url) {
        const isValid = ytdl.validateURL(url);

        if (isValid) {
            const videoName = (await ytdl.getInfo(url)).videoDetails.title;

            res.header(
                "Content-Disposition",
                `attachment; filename="${videoName}.mp4"`
            );

            ytdl(url, {
                quality: "highest",
                format: "mp4",
            }).pipe(res);
        } else {
            res.status(400).send("Invalid url");
        }
    } else {
        res.status(400).send("Invalid query");
    }
});

app.listen(process.env.PORT || 3500, () => {
    console.log(`Server running on port ${PORT}`);
});
