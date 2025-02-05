import axios from "axios";
import Util from "../utils/Util";
import InterswitchService from "../services/InterswitchService";

const util = new Util();

const premblyAxios = axios.create({});
const paystackAxios = axios.create({});
const interswitchAxios = axios.create({});
const interswitch2Axios = axios.create({});
const walletAxios = axios.create({});
const authAxios = axios.create({});

// let prembly_sk: string | undefined, prembly_app_id: string | undefined;

const prembly_sk = process.env.prembly_SECRET;
const prembly_app_id = process.env.prembly_APP_ID;

// Interceptor for the first axios instance
premblyAxios.interceptors.request.use(
	(config: any) => {
		config.headers = {
			...config.headers,
			accept: "application/json",
			"app-id": prembly_app_id,
			"x-api-key": prembly_sk,
		};

		// Base URL for the authentication API
		config.baseURL = process.env.prembly_BASE_URL;
		config.withCredentials = true;

		// console.log("Axios Request Config (auth):", config);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

paystackAxios.interceptors.request.use(
	(config: any) => {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${process.env.paystack_SECRETKEY}`,
		};

		// Base URL for the authentication API
		config.baseURL = process.env.paystack_BASE_URL;
		config.withCredentials = true;

		// console.log("Axios Request Config (auth):", config);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

const encode = util.base64Encode(
	`${process.env.interswitch_CLIENTID}:${process.env.interswitch_SECRETKEY}`
);

interswitchAxios.interceptors.request.use(
	(config: any) => {
		config.headers = {
			...config.headers,
			Authorization: `Basic ${encode}`,
			accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		};
		// Base URL for the authentication API
		config.baseURL = process.env.interswitch_BASE_URL;

		// console.log("Axios Request Config (auth):", config);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

interswitch2Axios.interceptors.request.use(
	async (config: any) => {
		const token = await InterswitchService.getAccessToken();
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${token}`,
			terminalId: process.env.interswitch_TERMINAL_ID,
			"Content-Type": "application/json",
		};
		// Base URL for the authentication API
		config.baseURL = process.env.interswitch2_BASE_URL;

		// console.log("Axios Request Config (auth):", config);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

authAxios.interceptors.request.use(
	(config: any) => {
		config.baseURL = process.env.authService;
		config.withCredentials = true;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

walletAxios.interceptors.request.use(
	(config: any) => {
		config.baseURL = process.env.wallet_BASE_URL;
		config.withCredentials = true;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

const logResponse = (response: any) => {
	console.log({
		url: response.config.baseURL + response.config.url,
		method: response.config.method,
		status: response.status,
		data: response.data,
	});
	return response;
};

const logError = (error: any) => {
	console.error("[ERROR]", {
		url: error.config?.baseURL + error.config?.url,
		method: error.config?.method,
		requestHeaders: error.config?.headers,
		requestBody: error.config?.data,
		status: error.response?.status,
		responseData: error.response?.data,
	});

	return Promise.reject(error);
};

const axiosInstances = [
	premblyAxios,
	paystackAxios,
	interswitchAxios,
	interswitch2Axios,
	walletAxios,
	authAxios,
];

axiosInstances.forEach((instance) => {
	instance.interceptors.response.use(logResponse, logError);
});

export {
	premblyAxios,
	paystackAxios,
	walletAxios,
	authAxios,
	interswitchAxios,
	interswitch2Axios,
};
