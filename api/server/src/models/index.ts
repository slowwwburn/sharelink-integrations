"use strict";
import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import createLogger from "../../utils/Logger";
import configFile from "../config/config";

dotenv.config();

const log = createLogger(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];
const db: { [key: string]: any } = {};

let sequelize: Sequelize;

const shouldLog = process.env.NODE_ENV !== "production";
const loggingFunction = (msg: string) => {
	if (shouldLog) log(`[Sequelize]: ${msg}`);
};

if (config.use_env_variable !== undefined) {
	sequelize = new Sequelize(process.env[config.use_env_variable]!, config);
} else {
	sequelize = new Sequelize(
		config.database!,
		config.username!,
		config.password!,
		// config,
		{
			host: config.host,
			dialect: config.dialect,
			pool: config.pool,
			logging: loggingFunction,
		}
	);
}

fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 &&
			file !== basename &&
			(file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
			file.indexOf(".test.ts") === -1 &&
			file.indexOf(".test.js") === -1
		);
	})
	.forEach(async (file) => {
		try {
			log(`Loading model from file: ${file}`);
			const { default: model } = await import(path.join(__dirname, file));
			const initializedModel = model(sequelize, DataTypes);
			log(`Model initialized: ${initializedModel.name}`);
			db[initializedModel.name] = initializedModel;
		} catch (error: any) {
			log(`Error loading model from file ${file}: ${error.message}`);
		}
	});

Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// authenticateDb();

let retryAttempts = 5;
async function connectWithRetry() {
	while (retryAttempts > 0) {
		try {
			await sequelize.authenticate();
			log("Database connection has been established successfully.");
			return;
		} catch (error) {
			retryAttempts -= 1;
			log(
				`Unable to connect to the database: ${JSON.stringify(
					error
				)}. Retries left: ${retryAttempts}`
			);
			if (retryAttempts > 0) {
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}
	}
	log("Max retry attempts reached. Exiting process.");
	process.exit(1); // Optionally exit the process if retries fail
}

connectWithRetry();

export const closeDatabase = async () => {
	await sequelize.close();
	log("Database connection closed");
};

export { sequelize };

export default db;
