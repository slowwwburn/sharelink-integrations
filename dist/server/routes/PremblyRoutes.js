"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PremblyController_1 = __importDefault(require("../controllers/PremblyController"));
const route = (0, express_1.Router)();
route.post("/bvn/basic", PremblyController_1.default.validateBVN);
exports.default = route;
