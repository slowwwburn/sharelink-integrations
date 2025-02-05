import { premblyAxios } from "../utils/axiosInstance";
import createLogger from "../utils/Logger";
import Util from "../utils/Util";
import qs from "qs";

const log = createLogger(__filename);
const util = new Util();

class Prembly {
	static async validateBVN(bvn: any) {
		log(bvn);
		try {
			const headers = {
				"content-type": "application/x-www-form-urlencoded",
			};
			const encodedParams = new URLSearchParams();
			encodedParams.set("number", "54651333604");
			const { data }: any = await premblyAxios.post(
				"/identitypass/verification/bvn_validation",
				encodedParams,
				{ headers }
			);
			log("Prembly success response ", data);
			const validated = data.data;

			// if (
			// 	bvn.firstName === validated.firstName &&
			// 	bvn.lastName === validated.lastName &&
			// 	util.compareDate(bvn.dob, validated.dateOfBirth)
			// )
			return validated;
			// else return false;
		} catch (err: any) {
			log("An error occurred ", err.message);
			throw err;
		}
	}
}

export default Prembly;
