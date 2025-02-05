import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import Prembly from "../services/PremblyService";

const log = createLogger(__filename);
const util = new Util();

class PremblyController {
	static async validateBVN(req: Request, res: Response) {
		log("Request to validate bvn received");

		const bvn = req.body;
		const requiredFields = ["firstName", "lastName", "dob", "bvn"];
		const dateRegex = /^\d{2}\/[A-Za-z]{3}\/\d{4}$/;

		if (util.payloadisInvalid(bvn, requiredFields)) {
			util.setError(400, "98", "Bad Request");
			return util.send(res);
		}

		if (!dateRegex.test(bvn.dob)) {
			util.setError(400, "98", "Invalid date format");
			return util.send(res);
		}

		if (bvn.bvn.length !== 11) {
			util.setError(400, "98", "BVN must be 11 digits");
			return util.send(res);
		}

		// const { bvn, firstName, lastName, middleName, dob, phoneNumber } = bvnReq;
		try {
			const validatedBVN = await Prembly.validateBVN(bvn);

			validatedBVN
				? util.setSuccess(200, "00", "BVN Validated", validatedBVN)
				: util.setError(400, "05", "BVN Mismatch");
			return util.send(res);
		} catch (err: any) {
			log("An error occurred ", err);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}
}

export default PremblyController;
