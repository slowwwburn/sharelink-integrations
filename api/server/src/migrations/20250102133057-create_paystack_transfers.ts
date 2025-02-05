import { query } from "express";
import { DataTypes, QueryInterface, Sequelize, Op } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.createTable("PaystackTransfers", {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				unique: true,
			},
			amount: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			beneficiary: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			beneficiaryAccount: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			bankCode: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reference: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			recipientCode: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			date: {
				type: DataTypes.DATE,
				defaultValue: 0,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.dropTable("PaystackTransfers");
	},
};
