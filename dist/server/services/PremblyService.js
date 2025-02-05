"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axiosInstance_1 = require("../utils/axiosInstance");
const Logger_1 = __importDefault(require("../utils/Logger"));
const Util_1 = __importDefault(require("../utils/Util"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class Prembly {
    static validateBVN(bvn) {
        return __awaiter(this, void 0, void 0, function* () {
            log(bvn);
            try {
                const headers = {
                    "content-type": "application/x-www-form-urlencoded",
                };
                const encodedParams = new URLSearchParams();
                encodedParams.set("number", "54651333604");
                const { data } = yield axiosInstance_1.premblyAxios.post("/identitypass/verification/bvn_validation", encodedParams, { headers });
                log('Prembly success response ', data);
                const validated = data.data;
                if (bvn.firstName === validated.firstName &&
                    bvn.lastName === validated.lastName &&
                    util.compareDate(bvn.dob, validated.dateOfBirth))
                    return true;
                else
                    return false;
            }
            catch (err) {
                log("An error occurred ", err.message);
                throw err;
            }
        });
    }
}
exports.default = Prembly;
