"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const Logger_1 = __importDefault(require("./Logger"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const RedisClient_1 = __importDefault(require("./RedisClient"));
dotenv_1.default.config();
const saltRounds = Number(process.env.saltRounds);
const jwtSecret = process.env.jwtSecret;
const tokenExpireTime = process.env.tokenExpireTime;
const log = (0, Logger_1.default)(__filename);
class Util {
    constructor() {
        this.statusCode = null;
        this.responseCode = null;
        this.type = null;
        this.data = null;
        this.message = null;
        this.download = null;
        this.file = null;
        this.errorCode = null;
    }
    setSuccess(statusCode, responseCode, message, data, file, errorCode) {
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : null;
        this.responseCode = responseCode !== null && responseCode !== void 0 ? responseCode : null;
        this.message = message !== null && message !== void 0 ? message : null;
        this.data = data !== null && data !== void 0 ? data : null;
        this.type = "true";
        this.errorCode = errorCode !== null && errorCode !== void 0 ? errorCode : null;
    }
    setError(statusCode, responseCode, message) {
        this.statusCode = statusCode !== null && statusCode !== void 0 ? statusCode : null;
        this.responseCode = responseCode !== null && responseCode !== void 0 ? responseCode : null;
        this.message = message !== null && message !== void 0 ? message : null;
        this.type = "error";
    }
    send(res) {
        const result = {};
        if (this.responseCode !== null)
            result.responseCode = this.responseCode;
        if (this.message !== null)
            result.message = this.message;
        if (this.data !== null)
            result.data = this.data;
        if (this.download !== null)
            result.download = this.download;
        if (this.file !== null)
            result.file = this.file;
        if (this.errorCode !== null)
            result.errorCode = this.errorCode;
        return res.status(this.statusCode).json(result);
        if (this.download === "true") {
            return res.download(`${this.file}.csv`, `${this.file}.csv`, (err) => {
                if (err) {
                    res.status(500).send("error");
                }
                else {
                    console.log("file was downloaded");
                }
            });
        }
    }
    hashPassword(password) {
        log("Salting password");
        try {
            return bcrypt_1.default.hashSync(password, saltRounds);
        }
        catch (err) {
            throw err;
        }
    }
    comparePassword(password, passwordHash) {
        log("Comparing password");
        try {
            if (password === passwordHash) {
                return true;
            }
            const result = bcrypt_1.default.compareSync(password || "", passwordHash);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    compareSignature(body, signature) {
        log("Comparing signature");
        log(JSON.stringify(body));
        if (jwtSecret) {
            const hash = crypto_1.default
                .createHmac("sha512", Buffer.from(jwtSecret, "utf8"))
                .update(Buffer.from(body, "utf8"))
                .digest("hex");
            log(hash);
            log(signature);
            return signature === hash;
        }
        else {
            log("Secret key is not defined");
            return false;
        }
    }
    generateToken(params, expire) {
        log("Generating token");
        log(params);
        try {
            const token = jsonwebtoken_1.default.sign(params, this.base64Encode(jwtSecret), {
                expiresIn: expire ? parseInt(expire) : parseInt(tokenExpireTime),
            });
            log(`Token generated, to expire in, ${expire ? expire : tokenExpireTime}`);
            return { accessToken: token, expiresIn: expire || tokenExpireTime };
        }
        catch (err) {
            log(err);
            throw err;
        }
    }
    verifyToken(token) {
        try {
            const verify = jsonwebtoken_1.default.verify(token, this.base64Encode(jwtSecret));
            return verify;
        }
        catch (err) {
            log(err);
            throw err;
        }
    }
    runMemoryChecks() {
        const THRESHOLD_PERCENTAGE = 0.8;
        const MAX_MEMORY_MB = 512;
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            const rssUsedMB = memoryUsage.rss / 1024 / 1024;
            const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
            const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
            const memoryLeftMB = MAX_MEMORY_MB - rssUsedMB;
            const heapUsedPercentage = (heapUsedMB / heapTotalMB) * 100;
            log(`RSS Used: ${rssUsedMB.toFixed(2)} MB`);
            log(`Heap Total: ${heapTotalMB.toFixed(2)} MB`);
            log(`Heap Used: ${heapUsedMB.toFixed(2)} MB`);
            log(`Memory Left: ${memoryLeftMB.toFixed(2)} MB`);
            log(`Heap Usage: ${heapUsedPercentage.toFixed(2)}%`);
            if (heapUsedPercentage > THRESHOLD_PERCENTAGE * 100) {
                console.error("🚨 Memory usage approaching limit! Potential leak detected.");
            }
        }, 1000 * 60);
    }
    generateOTP() {
        const randomValue = crypto_1.default.randomInt(Math.pow(10, 4));
        return randomValue.toString().padStart(4, "0");
    }
    readJsonFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileContent = yield fs_extra_1.default.readFile(path, "utf8");
                return JSON.parse(fileContent);
            }
            catch (error) {
                console.error("Error reading or parsing JSON file:", error);
                throw error;
            }
        });
    }
    base64Encode(params) {
        let bufferObj = Buffer.from(params, "utf8");
        let base64String = bufferObj.toString("base64");
        return base64String;
    }
    base64Decode(params) {
        let bufferObj = Buffer.from(params, "base64");
        let decodedString = bufferObj.toString("utf8");
        return decodedString;
    }
    cryptoHash(params) {
        return crypto_1.default.createHash("sha512").update(params).digest("hex");
    }
    sendMail(html, address, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Mail is being composed");
            var user = "olalekanbalogun95@gmail.com";
            var transporter = nodemailer_1.default.createTransport({
                service: "Gmail",
                auth: {
                    user,
                    pass: process.env.email,
                },
            });
            try {
                const info = yield transporter.sendMail({
                    from: "The Loap App",
                    to: address,
                    subject: subject,
                    html,
                });
                log("Mail has been sent ", info.response);
                return info;
            }
            catch (err) {
                log(err);
                throw err;
            }
        });
    }
    generateRandomWord() {
        const alpha = "abcdefghijklmnopqrstuvwxyz";
        const wordLength = Math.floor(Math.random() * 3) + 4;
        let word = "";
        for (let i = 0; i < wordLength; i++) {
            const randomIndex = Math.floor(Math.random() * alpha.length);
            word += alpha[randomIndex];
        }
        return word;
    }
    isInvalid(value) {
        return value === undefined || value === null || value === "";
    }
    payloadisInvalid(params, requiredFields) {
        log("Checking request payload ", params);
        const hasMissingFields = requiredFields.some((field) => this.isInvalid(params[field]));
        hasMissingFields ? log("Payload is Invalid") : log("Payload is valid");
        return hasMissingFields;
    }
    getDate(t) {
        let d = new Date();
        let day = d.getDate();
        let month = d.getMonth() + 2;
        let year = d.getFullYear();
        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        let hours = d.getUTCHours();
        let minutes = d.getUTCMinutes();
        let seconds = d.getUTCSeconds();
        let time = d.getTime();
        let date = `${day}/${month}/${year} 00:00:00+0000`;
        let dfloan = `${day}-${month}-${year} 00:00:00+0000`;
        let timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+000000`;
        let startDate, endDate = null;
        if (t) {
            startDate = `${year}/${month}/${day}`;
            let endMonth = parseInt(month) + parseInt(t);
            if (endMonth <= 12)
                endDate = `${year}/${endMonth}/${day}`;
            else
                endDate = `${year + 1}/${endMonth - 12}/${day}`;
        }
        log(startDate, endDate);
        return { time, date, timestamp, dfloan, startDate, endDate };
    }
    formatDate(date) {
        let d;
        if (date) {
            d = new Date(date.toString());
        }
        else {
            d = new Date();
        }
        let dd = d.getDate();
        let mm = d.getMonth() + 1;
        let yyyy = d.getFullYear();
        let ddloan = `${dd}/${mm}/${yyyy}`;
        let dfloan = `${dd}-${mm}-${yyyy} 00:00:00+0000`;
        return { dfloan, ddloan };
    }
    compareDate(dat1, dat2) {
        const removeDash = (date) => {
            return date.replace(/-/g, "/");
        };
        const date1 = removeDash(dat1);
        const date2 = removeDash(dat2);
        if (date1 === date2)
            return true;
        else
            return false;
    }
    checkMemory() {
        const memoryUsage = process.memoryUsage();
        log(`RSS: ${memoryUsage.rss}`);
        log(`Heap Total: ${memoryUsage.heapTotal}`);
        log(`Heap Used: ${memoryUsage.heapUsed}`);
        log(`External: ${memoryUsage.external}`);
    }
    generatePrimaryKey() {
        log("Generating primary key");
        const timestamp = Math.floor(Date.now() / 1000);
        const randomNumber = Math.floor(Math.random() * 1000) + 1;
        const formattedRandomNumber = randomNumber.toString().padStart(4, "0");
        log(timestamp, formattedRandomNumber);
        return parseInt(`${timestamp}${formattedRandomNumber}`);
    }
    redisPost(key, param, expInSecs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.set(key, param, { EX: expInSecs });
                log("Insert to Redis successful");
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    redisPostSet(key, params, expInSecs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.sAdd(key, params);
                yield RedisClient_1.default.expire(key, expInSecs);
                log("Insert to Redis successful");
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    redisUpdateSet(key, param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield RedisClient_1.default.exists(key);
                if (exists) {
                    const ttl = yield RedisClient_1.default.ttl(key);
                    yield RedisClient_1.default.sAdd(key, param);
                    log("Set update in Redis was successful");
                    if (ttl > 0) {
                        yield RedisClient_1.default.expire(key, ttl);
                    }
                    return;
                }
                else {
                    log(`Set doesn't exist in redis`);
                    throw new Error(`Set doesn't exist`);
                }
            }
            catch (err) {
                log(err.message);
                throw err;
            }
        });
    }
    redisGet(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const val = yield RedisClient_1.default.get(key);
                log("Get from redis successful");
                return val;
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
    redisDelete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.del(key);
                log("Delete from redis successful");
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
    redisGetAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.keys("*");
                log("Get from redis successful");
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
    redisFlush() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield RedisClient_1.default.flushAll();
                log("All entries deleted");
            }
            catch (err) {
                log("An error occurred", err.message);
                throw err;
            }
        });
    }
}
exports.default = Util;
