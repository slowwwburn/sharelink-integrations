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
const Logger_1 = __importDefault(require("../utils/Logger"));
const Util_1 = __importDefault(require("../utils/Util"));
const PremblyService_1 = __importDefault(require("../services/PremblyService"));
const log = (0, Logger_1.default)(__filename);
const util = new Util_1.default();
class PremblyController {
    static validateBVN(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Request to validate bvn received");
            const bvn = req.body;
            const requiredFields = ["firstName", "lastName", "dob", "bvn"];
            const dateRegex = /^\d{2}\/[A-Za-z]{3}\/\d{4}$/;
            if (util.payloadisInvalid(bvn, requiredFields)) {
                util.setError(400, "98", "Bad Request");
                return util.send(res);
            }
            if (!dateRegex.test(bvn.dob)) {
                util.setError(400, "98", "Invalid date format");
                return util.send(res);
            }
            if (bvn.bvn.length !== 11) {
                util.setError(400, "98", "BVN must be 11 digits");
                return util.send(res);
            }
            try {
                const validatedBVN = yield PremblyService_1.default.validateBVN(bvn);
                validatedBVN
                    ? util.setSuccess(200, "00", "BVN Validated", validatedBVN)
                    : util.setSuccess(200, "05", "BVN Mismatch");
                return util.send(res);
            }
            catch (err) {
                log("An error occurred ", err);
                util.setError(500, "99", "An Error Occurred");
                return util.send(res);
            }
        });
    }
}
exports.default = PremblyController;
