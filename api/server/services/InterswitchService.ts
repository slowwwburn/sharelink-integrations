import Util from "../utils/Util";
import createLogger from "../utils/Logger";
import { Sequelize, QueryTypes, where } from "sequelize";
import db, { sequelize } from "../src/models";
import { interswitch2Axios, interswitchAxios } from "../utils/axiosInstance";

const log = createLogger(__filename);
const util = new Util();

class InterswitchService {
	static async getAccessToken() {
		try {
			log("Checking memory for active token");
			const token = await util.redisGet("IS_access");

			if (token) {
				log("Active token found");
				return token;
			}

			log(
				"No active token found, triggering request to Interswitch for acces token"
			);

			const { data } = await interswitchAxios.post<any>(
				"/passport/oauth/token?grant_type=client_credentials"
			);

			log("Token gotten, saving to memory");
			const expiryBuffer = 30;
			await util.redisPost(
				"IS_access",
				data.access_token,
				Math.max(0, data.expires_in - expiryBuffer)
			);
			return data.access_token;
		} catch (err: any) {
			log(
				"An error occurred while attempting to get interswitch access",
				err.message
			);
			throw err;
		}
	}

	static async getCategories() {
		try {
			const token = await this.getAccessToken();
			const { data } = await interswitch2Axios.get<any>(
				"/services/categories",
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			return data.BillerCategories;
		} catch (err: any) {
			log("An error occurred during attempt to get billers", err.message);
			throw err;
		}
	}

	static async getBillersByCategory(category: string) {
		try {
			const token = await this.getAccessToken();
			const { data } = await interswitch2Axios.get<any>(
				`/services?categoryId=${category}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			return data.BillerList.Category[0].Billers;
		} catch (err: any) {
			log(
				`An error occurred while attempting to get billers for category ${category}`,
				err.message
			);
			throw err;
		}
	}

	static async getBillerServices(billerId: string) {
		try {
			const token = await this.getAccessToken();
			const { data } = await interswitch2Axios.get<any>(
				`/services/options?serviceid=${billerId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			return data.PaymentItems;
		} catch (err: any) {
			log(
				`An error occurred while attempting to get services for biller ${billerId}`,
				err
			);
			throw err;
		}
	}

	static async validateCustomer(customer: string, paymentCode: string) {
		try {
			// const token = await this.getAccessToken()
			const { data } = await interswitch2Axios.post(
				"/Transactions/validatecustomers",
				{
					customers: [
						{
							PaymentCode: paymentCode,
							CustomerId: customer,
						},
					],
					TerminalId: process.env.interswitch_TERMINAL_ID,
				}
			);
			return data;
		} catch (err: any) {
			log(
				`An error occurred while trying to validate customer ${customer}`,
				err.message
			);
			throw err;
		}
	}

	static async initiateBill(params: any) {
		try {
			const rawQuery = `SELECT * FROM "Users" WHERE "id" = :userId`;

			const user: any = await sequelize.query(rawQuery, {
				replacements: { userId: params.userId },
				type: QueryTypes.SELECT,
			});

			const { data } = await interswitch2Axios.post<any>("/Transactions", {
				paymentCode: params.paymentCode,
				customerId: params.customerId,
				customerMobile: user.phonenumber,
				customerEmail: user.email,
				amount: params.amount,
				requestReference: params.reference,
			});

			const bill = await db.InterswitchBill.create({
				id: Date.now(),
				amount: params.amount,
				reference: params.reference,
				transRef: data.TransactionRef,
				type: params.type,
				biller: params.biller,
				service: params.service,
				customerId: params.customerId,
				userId: params.userId,
				participantId: params.participantId,
			});

			return bill;
		} catch (err: any) {
			log(
				"An error occurred while trying to process bill payment",
				err.message
			);
			throw err;
		}
	}
}

export default InterswitchService;
