import { Request, Response, NextFunction } from "express";
import InterswitchService from "../services/InterswitchService";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";

const log = createLogger(__filename);
const util = new Util();

class InterswitchController {
	static async getCategories(req: Request, res: Response) {
		log("Request to retrieve biller categories received");
		try {
			const categories = await InterswitchService.getCategories();
			util.setSuccess(200, "00", "Biller categories retrieved", categories);
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async getBillersByCategory(req: Request, res: Response) {
		log(`Request to get billers in category ${req.query.categoryId} received`);
		try {
			const categoryId = req.query.categoryId as string;

			const billers = await InterswitchService.getBillersByCategory(categoryId);
			util.setSuccess(200, "00", "Billers retrieved", billers);
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async getBillerServices(req: Request, res: Response) {
		log(`Request to get services for biller ${req.query.billerId} received`);
		try {
			const billerId = req.query.billerId as string;
			const services = await InterswitchService.getBillerServices(billerId);
			util.setSuccess(200, "00", "Services retrieved", services);
			return util.send(res);
		} catch (err: any) {
			log(err);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async validateCustomer(req: Request, res: Response) {
		log(`Request to validate customer bill info received`);
		try {
			const { customer, paymentCode } = req.body;

			const validated = await InterswitchService.validateCustomer(
				customer,
				paymentCode
			);
			util.setSuccess(200, "00", "Customer Validated", validated);
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}

	static async initiateBill(req: Request, res: Response) {
		log("Request to process a initiate bill payment");
		
		try {
			const bill = await InterswitchService.initiateBill(req.body);
			util.setSuccess(200, "00", "Payment request sent", bill);
			return util.send(res);
		} catch (err: any) {
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}
}

export default InterswitchController;
