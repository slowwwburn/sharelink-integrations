import { Router } from "express";
import PremblyController from "../controllers/PremblyController";

const route = Router();

route.post("/bvn/basic", PremblyController.validateBVN);

export default route;
