"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance2 = exports.premblyAxios = void 0;
const axios_1 = __importDefault(require("axios"));
const premblyAxios = axios_1.default.create({});
exports.premblyAxios = premblyAxios;
const axiosInstance2 = axios_1.default.create({});
exports.axiosInstance2 = axiosInstance2;
let prembly_sk, prembly_app_id;
if (process.env.NODE_ENV === "development") {
    prembly_sk = process.env.prembly_DEV_SECRET;
    prembly_app_id = process.env.prembly_DEV_APP_ID;
}
else if (process.env.NODE_ENV === "production") {
    prembly_sk = process.env.prembly_SECRET;
    prembly_app_id = process.env.prembly_APP_ID;
}
premblyAxios.interceptors.request.use((config) => {
    config.headers = Object.assign(Object.assign({}, config.headers), { accept: "application/json", "app-id": prembly_app_id, "x-api-key": prembly_sk });
    config.baseURL = process.env.prembly_BASE_URL;
    config.withCredentials = true;
    return config;
}, (error) => {
    return Promise.reject(error);
});
axiosInstance2.interceptors.request.use((config) => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    if (token) {
        config.headers = Object.assign(Object.assign({}, config.headers), { Authorization: `Bearer ${token}` });
    }
    config.baseURL = process.env.REACT_APP_API_BASE_URL;
    return config;
}, (error) => {
    return Promise.reject(error);
});
console.log(process.env.REACT_APP_API_KEY);
