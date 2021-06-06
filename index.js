'use strict';
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import https from "https";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import fileUpload from "express-fileupload";
import { nanoid } from 'nanoid';
import { execSync } from "child_process";

const app = express();
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true
    })
);
app.use(compression());
app.use(express.static('static'));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

if (process.env.NODE_ENV == "production")
    app.set('trust proxy', 1);

const version = process.env.npm_package_version;
const port = process.env.PORT || 443;

const sslConfig = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || './ssl/cert_key.pem'),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || './ssl/cert.pem'),
};

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many upload created from this IP, please try again after 15 minutes"
});


app.post("/upload", uploadLimiter, (req, res) => {
    if (!req.files || !req.files.file || req.files.file.truncated)
        return res.sendStatus(400);

    let fileNameArr = req.files.file.name.split('.');
    let ext = fileNameArr[fileNameArr.length - 1];

    if (!(ext == "ass"))
        return res.sendStatus(400);

    let id = nanoid();

    if (!fs.existsSync('./tmp/'))
        fs.mkdirSync('./tmp/');

    req.files.file.mv(`./tmp/${id}.${ext}`, () => {
        execSync(`mono ./bin/YTSubConverter.exe ./tmp/${id}.${ext}`);
        if (!fs.existsSync(`./tmp/${id}.ytt`)) {
            res.sendStatus(500);
            return;
        }
        res.status(201);
        res.sendFile(`./tmp/${id}.ytt`, { root: './' }, () => {
            if (fs.existsSync(`./tmp/${id}.${ext}`))
                fs.rmSync(`./tmp/${id}.${ext}`);
            if (fs.existsSync(`./tmp/${id}.ytt`))
                fs.rmSync(`./tmp/${id}.ytt`);
        });
    });
});

https.createServer(sslConfig, app).listen(port, () => {
    console.log(`YTSubConverterWeb(${version}) by edisonlee55`);
    console.log(`Listening on port ${port}`);
});
