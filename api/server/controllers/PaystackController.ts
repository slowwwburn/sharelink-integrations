import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import PaystackService from "../services/PaystackService";
import { io, userSocketMap } from "../../app";

const log = createLogger(__filename);
const util = new Util();

class PaystackController {
	static async createCustomer(req: Request, res: Response) {
		log("Request to create paystcack customer received");

		const requiredFields = ["userId"];

		if (util.payloadisInvalid(req.body, requiredFields)) {
			util.setError(400, "98", "Bad Request");
			return util.send(res);
		}

		const { userId } = req.body;

		try {
			const created = await PaystackService.createCustomer(userId);

			created
				? util.setSuccess(200, "00", "Customer created", created.data)
				: util.setError(400, "05", "BVN Mismatch");
			return util.send(res);
		} catch (err: any) {
			log("An error occurred ", err);
			util.setError(500, "99", "An Error Occurred");
			return util.send(res);
		}
	}

	static async validationStatus(req: Request, res: Response) {
		log("Customer validation status received");
		try {
			const status = req.body;
			const verified = await PaystackService.validationStatus(status);
			return "Ok";
		} catch (err: any) {
			log("an error occurred", err);
			util.setError(500, "99", "An error occurred");
			return util.send(res);
		}
	}

	static async createDVA(req: Request, res: Response) {
		log("Request to create DVA received");
		const { userId } = req.body;
		try {
			const account = await PaystackService.createDVA(userId);
			account
				? util.setSuccess(
						200,
						"00",
						"Dedicated Virtual Account Created",
						account
				  )
				: util.setError(400, "98", "User yet to be validate with paystack");
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", "An error occurred");
			return util.send(res);
		}
	}

	static async initCollection(req: Request, res: Response) {
		log("Request to initiate paystack collection recevied");
		const { userId, amount } = req.body;

		console.log(req.body)
		if (!amount || !userId) {
			const missingField = !amount ? "amount" : "userId";
			log(`${missingField} field is required`);
			util.setError(400, "98", `${missingField} field is required`);
			return util.send(res);
		}

		try {
			const initiate = await PaystackService.initCollection({ userId, amount });
			util.setSuccess(200, "00", "Collection Initiated", initiate);
			return util.send(res);
		} catch (err: any) {
			log("Error upon initiating paystack collection");
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async validateTransactionStatus(req: Request, res: Response) {
		log("Paystack collection webhook received");
		try {
			const secretKey = process.env.paystack_SECRETKEY;

			if (!secretKey) {
				util.setError(500, "99", "No authorization");
				return util.send(res);
			}

			console.log(req.body)
			const hash = util.createHmac(JSON.stringify(req.body), secretKey);
			if (
				req.body.event === "charge.success" &&
				((process.env.PAYSTACK_ENV === "live" &&
					hash === req.headers["x-paystack-signature"]) ||
					process.env.PAYSTACK_ENV === "test")
			) {
				// Retrieve the request's body
				const event = req.body.data;
				const validation = await PaystackService.validateTransactionStatus(
					event
				);

				const userSocketId = userSocketMap.get(validation.userId); // Get socket ID for the user
				if (userSocketId) {
					log(userSocketId);
					io.to(userSocketId).emit("walletUpdate", {
						status: true,
					});
				} else {
					console.log(`User ${validation.userId} is not connected`);
				}

				validation
					? util.setSuccess(200, "00", "Ok")
					: util.setError(400, "98", "Transaction doesn't exist");
				return util.send(res);
			} else {
				log("Webhook origin unknown");
				util.setError(400, "98", "Invalid payload");
				return util.send(res);
			}
		} catch (err: any) {
			log("Error during transaction validation", err);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}
}

export default PaystackController;
