import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import { authAxios } from "../utils/axiosInstance";
import AuthService from "../services/AuthService";

const log = createLogger(__filename);
const util = new Util();

class AuthController {
	static async validateUser(req: Request, res: Response, next: NextFunction) {
		log("Validating user");
		const authorization = req.headers.authorization;
		const token = authorization?.split(" ")[1] ?? null;
		const apikey = req.headers.api_key;

		if (!token && !apikey) {
			log("No authentication provided");
			util.setError(401, "41", "Unauthorized");
			return util.send(res);
		}

		token ? log("Token retrieved from request") : null;
		apikey ? log("Apikey retrieved from headers") : null;

		try {
			if (token) {
				log("Validating using token");

				const verified = await AuthService.validateUser(token);
				if (verified.id) {
					res.locals.userId = verified.id;
					log("User validated via token");
					return next();
				} else {
					log("Invalid token");
					util.setError(401, "41", "Unauthorized");
					return util.send(res);
				}
			}

			if (apikey && process.env.API_KEY === apikey) {
				res.locals.apikey = apikey;
				log("Authorization granted via apikey");
				return next();
			}

			log("Invalid API key");
			util.setError(401, "41", "Unauthorized");
			return util.send(res);
		} catch (err: any) {
			log("Error during user validation", err.message);
			util.setError(500, "99", "Internal Server Error");
			return util.send(res);
		}
	}
}

export default AuthController;
