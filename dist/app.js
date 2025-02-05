"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Logger_1 = __importDefault(require("./server/utils/Logger"));
const Util_1 = __importDefault(require("./server/utils/Util"));
const RedisClient_1 = require("./server/utils/RedisClient");
const index_1 = require("./server/src/models/index");
const KycRoutes_1 = __importDefault(require("./server/routes/KycRoutes"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
const app = (0, express_1.default)();
const cookieParser = require("cookie-parser");
const allowedOrigins = ["localhost:3500"];
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((0, helmet_1.default)());
app.use(limiter);
const port = process.env.PORT;
log("Booting up Integrations service");
log("Creating routes into Integrations");
const base = "/integration/api";
app.use(`${base}/v1/kyc`, KycRoutes_1.default);
app.all("*", (req, res) => res.status(404).json({
    message: `${req.originalUrl} not found.`,
}));
log("routes created");
const server = app.listen(port, () => {
    log(`Integration server is running on PORT ${port}`);
});
util.runMemoryChecks();
function cleanupAndExit() {
    Promise.all([
        server.close(() => log("Server closed")),
        (0, RedisClient_1.closeRedis)(),
        (0, index_1.closeDatabase)(),
    ])
        .then(() => {
        process.exit(0);
    })
        .catch((err) => {
        log("Error while closing a resource: ", err);
        process.exit(1);
    });
}
process.once("SIGTERM", cleanupAndExit);
process.once("SIGINT", cleanupAndExit);
exports.default = app;
