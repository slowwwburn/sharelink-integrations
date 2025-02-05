import { Request, Response, NextFunction } from "express";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import { authAxios } from "../utils/axiosInstance";

const log = createLogger(__filename);
const util = new Util();

class AuthService {
	static async validateUser(token: string) {
		log("Validating user");
		try {
			log("Validating using token");
			const { data } = await authAxios.get<any>("/auth/token", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return data.data;
		} catch (err: any) {
			log("Error during user validation", err.message);
			throw err;
		}
	}
}

export default AuthService;
