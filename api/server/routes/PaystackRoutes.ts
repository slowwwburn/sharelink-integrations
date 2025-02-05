import { Router } from "express";
import PaystackController from "../controllers/PaystackController";

const route = Router();

route.post("/customer/create", PaystackController.createCustomer);
route.post("/collection/init", PaystackController.initCollection)
route.post(
	"/transaction/webhook",
	PaystackController.validateTransactionStatus
);

export default route;
