import express, { Request, Response, NextFunction } from "express";

import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import createLogger from "./server/utils/Logger";
import Util from "./server/utils/Util";
import { closeRedis } from "./server/utils/RedisClient";
import { closeDatabase } from "./server/src/models/index";
import KycRoutes from "./server/routes/KycRoutes";
import paystackRoutes from "./server/routes/PaystackRoutes";
import interswitchRoutes from "./server/routes/InterswitchRoutes";
import AuthService from "./server/services/AuthService";
import { Server } from "socket.io";
// import Auth from "./server/routes/AuthRoutes";

const log = createLogger(__filename);
const util = new Util();
const app = express();
const cookieParser = require("cookie-parser");
const allowedOrigins = ["http://localhost:3001", "http://localhost:3001"];
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(limiter);
app.use(
	cors({
		// origin: (origin, callback) => {
		// 	log("This is the origin ", origin);
		// 	if (!origin || (origin && allowedOrigins.includes(origin))) {
		// 		callback(null, true);
		// 	} else {
		// 		const error = new Error("CORS policy violation");
		// 		callback(error); // Pass the error to Express error handler
		// 	}
		// },
		origin: true,
		credentials: true,
	})
);

// Custom Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err.message === "CORS policy violation") {
		log("CORS Error: ", err); // Log the error
		res.status(403).json({ message: err.message }); // Custom CORS response
	} else {
		next(err); // Forward other errors to the default error handler
	}
});

const port = process.env.PORT;

// process.env.DEBUG = "app:*";

log("Booting up Integrations service");
log("Creating routes into Integrations");

const base = "/integration/api";
app.use(`${base}/v1/kyc`, KycRoutes);
app.use(`${base}/v1/paystack`, paystackRoutes);
app.use(`${base}/v1/interswitch`, interswitchRoutes);
// when a random route is inputed
app.all("*", (req: Request, res: Response) =>
	res.status(404).json({
		message: `${req.originalUrl} not found.`,
	})
);

log("routes created");

const server = app.listen(port, () => {
	log(`Integration server is running on PORT ${port}`);
});

// Initialize socket.io after the server starts
const io = new Server(server, {
	cors: {
		origin: "*", // Change this as needed
	},
});

// Add authentication middleware for Socket.IO
io.use(async (socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error("Authentication token is required"));
		}

		const { id } = await AuthService.validateUser(token);
		(socket as any).userId = id; // Attach userId to the socket object
		next();
	} catch (error: any) {
		log("Authentication error:", error.message);
		next(new Error("Authentication failed"));
	}
});

const userSocketMap = new Map<string, string>();
// Handle Socket.IO connections
io.on("connection", (socket) => {
	const userId = (socket as any).userId; // Retrieve the authenticated userId
	console.log(`User connected: ${userId}`);

	if (userId) {
		userSocketMap.set(userId, socket.id);
		console.log(`User ${userId} connected with socket ID ${socket.id}`);
	}

	// Emit a welcome message
	socket.emit("welcome", `Welcome, user ${userId}!`);

	// Handle custom events here
	socket.on("walletFunded", (data) => {
		console.log(`Received data from user ${userId}:`, data);
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		userSocketMap.delete(userId);
		console.log(`User ${userId} disconnected`);
	});
});

function cleanupAndExit() {
	const closeServer = new Promise<void>((resolve, reject) => {
		server.close((err) => {
			if (err) {
				log("Error while closing server: ", err);
				reject(err);
			} else {
				log("Server closed");
				resolve();
			}
		});
	});

	Promise.all([closeServer, closeRedis(), closeDatabase()])
		.then(() => {
			log("All resources closed, exiting...");
			process.exit(0);
		})
		.catch((err) => {
			log("Error during cleanup: ", err);
			process.exit(1);
		});
}

process.once("SIGTERM", cleanupAndExit);
process.once("SIGINT", cleanupAndExit);

export { io, userSocketMap };

export default app;
