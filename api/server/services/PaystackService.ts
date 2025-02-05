import db, { sequelize } from "../src/models";
import { paystackAxios, walletAxios } from "../utils/axiosInstance";
import createLogger from "../utils/Logger";
import { Sequelize, QueryTypes, where } from "sequelize";
import Util from "../utils/Util";

const log = createLogger(__filename);
const util = new Util();

class PaystackService {
	static async validateAccount(params: any): Promise<any> {
		log("Validating account");
		try {
			const { data } = await paystackAxios.post<any>("/bank/resolve", {
				params: {
					account_number: params.accountNumber,
					bank_code: params.bankCode,
				},
			});

			if (data.status) return data.status;
		} catch (err: any) {
			log("an error occurred", err);
			throw err;
		}
	}

	static async createCustomer(userId: string): Promise<any> {
		log("Creating paystack customer");
		const transaction = db.sequelize.transaction();
		try {
			const rawQuery = `SELECT * FROM "Users" WHERE "id" = :userId`;

			const user: any[] = await sequelize.query(rawQuery, {
				replacements: { userId },
				type: QueryTypes.SELECT,
				transaction,
			});

			const { data } = await paystackAxios.post<any>("/customer", {
				email: user[0].email,
				first_name: user[0].firstName,
				last_name: user[0].lastName,
				phone: user[0].phonenumber,
			});

			const code = data.data.customer_code;
			const updateQuery = `UPDATE "Users" SET "paystackId"= :code WHERE "id" = :userId`;
			const updatedUser = await sequelize.query(updateQuery, {
				replacements: { userId, code },
				type: QueryTypes.UPDATE,
				transaction,
			});

			await transaction.commit();
			return data;
		} catch (err: any) {
			await transaction.rollback();
			log("An error occurred", err);
			throw err;
		}
	}

	static async validateCustomer(userId: any): Promise<any> {
		log("Validating customer");
		const transaction = await db.sequelize.transaction();
		try {
			const selectQuery = `SELECT * FROM "Users" WHERE "id"=:userId;`;

			const user: any[] = await sequelize.query(selectQuery, {
				replacements: { userId },
				type: QueryTypes.SELECT,
				transaction,
			});

			let reqData;
			if (process.env.PAYSTACK_ENV === "test") {
				reqData = {
					first_name: "Uchenna",
					last_name: "Okoro",
					account_number: "0111111111",
					back_code: "007",
					bvn: "222222222221",
					type: "bank_account",
					country: "NG",
				};
			} else {
				reqData = {
					first_name: user[0].firstname,
					last_name: user[0].lastname,
					account_number: user[0].accountNumber,
					back_code: user[0].bankCode,
					bvn: user[0].bvn,
					type: "bank_account",
					country: "NG",
				};
			}

			const { data } = await paystackAxios.post<any>(
				`/customer/${user[0].paystackId}/identification`,
				reqData
			);
		} catch (err: any) {
			await transaction.rollback();
			log("An error occured", err);
			throw err;
		}
	}

	static async validationStatus(params: any): Promise<any> {
		log("Confirming validation status");
		try {
			let reason;
			params.event === "customeridentification.success"
				? (reason = "Success")
				: (reason = params.data.reason);
			const updateQuery = `UPDATE "Users" SET "paystackStatus" = :reason WHERE "paystackId" = :paystackId`;
			const updated = await sequelize.query(updateQuery, {
				replacements: { paystackId: params.data.customer_code, reason },
			});
			return;
		} catch (err: any) {
			log("An error occurred", err);
			throw err;
		}
	}

	static async createDVA(userId: string): Promise<any> {
		log("Request to create DVA received");
		try {
			const selectQuery = `SELECT * FROM "Users" WHERE "id"=:userId;`;

			const user: any[] = await sequelize.query(selectQuery, {
				replacements: { userId },
				type: QueryTypes.SELECT,
			});

			if (user[0].paystackStatus !== "Success") {
				return false;
			}

			const { data } = await paystackAxios.post<any>("/dedicated_account", {
				customer: user[0].paystackId,
				preferred_bank: "titan-paystack",
			});

			const updateQuery = `UPDATE "Wallets" SET "dvaccountNumber"= :account WHERE "userId"= :userId;`;

			const updated: any[] = await sequelize.query(updateQuery, {
				replacements: { userId, account: data.data.account_number },
				type: QueryTypes.SELECT,
			});

			return updated;
		} catch (err: any) {
			log("An error occurred", err);
			throw err;
		}
	}

	static async initCollection(params: any): Promise<any> {
		log("Initializing paystack collection");
		try {
			const selectQuery = `SELECT "email" FROM "Users" WHERE "id"= :userId`;
			const user: any[] = await sequelize.query(selectQuery, {
				replacements: { userId: params.userId },
			});
			log(user[0]);

			if (!user || user[0].length === 0) return false;

			const { data } = await paystackAxios.post<any>(
				"/transaction/initialize",
				{
					email: user[0][0].email,
					amount: params.amount,
				}
			);

			log(data);

			const collection = await db.PaystackCollection.create({
				amount: params.amount,
				reference: data.data.reference,
				userId: params.userId,
				email: user[0][0].email,
				status: "pending",
				date: Date.now(),
				accessCode: data.data.access_code,
			});

			return data.data;
		} catch (err: any) {
			log("An error occurred", err);
			throw err;
		}
	}

	static async validateTransactionStatus(params: any): Promise<any> {
		log("Validating transaction status");
		delete params.id;
		try {
			const transaction = await db.PaystackCollection.findOne({
				where: { reference: params.reference },
			});

			log(transaction);

			if (!transaction) {
				return;
			}
			if (transaction.amount != params.amount) {
				log("Wrong amount was sent");
				return await db.PaystackCollection.update(
					{ status: "Failed: Wrong amount" },
					{
						where: { reference: params.reference },
					}
				);
			}

			const updated = await db.PaystackCollection.update(params, {
				where: { reference: params.reference },
			});

			if (updated[0] === 0) {
				log(`No record found for reference: ${params.reference}`);
				throw new Error(`No record found for reference: ${params.reference}`);
			} else {
				log(`Transaction updated for reference: ${params.reference}`);

				log(updated);

				const credited = await walletAxios.post<any>(
					"/wallet/credit",
					{
						userId: transaction.userId,
						amount: util.toDouble(params.amount),
						transactionId: `INT${Math.floor(Math.random() * 1000000)}`,
					},
					{ headers: { API_KEY: process.env.API_KEY } }
				);

				credited
					? log("Wallet credited successfully")
					: log(
							"Request to credit wallet failed, please credit the wallet manually"
					  );
			}
			return transaction;
		} catch (err: any) {
			log("An error occurred", err);
			throw err;
		}
	}
}

export default PaystackService;
