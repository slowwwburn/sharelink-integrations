import { Router } from "express";
import InterswitchController from "../controllers/InterswitchController";
import AuthController from "../controllers/AuthController";

const route = Router();

route.get(
	"/bills/categories",
	AuthController.validateUser,
	InterswitchController.getCategories
);
route.get(
	"/bills/billers",
	AuthController.validateUser,
	InterswitchController.getBillersByCategory
);
route.get(
	"/bills/billers/services",
	AuthController.validateUser,
	InterswitchController.getBillerServices
);
route.post(
	"/bills/validate/customer",
	AuthController.validateUser,
	InterswitchController.validateCustomer
);
route.post(
	"/bills/transaction/init",
	AuthController.validateUser,
	InterswitchController.initiateBill
);
export default route;
