import { query } from "express";
import { DataTypes, QueryInterface, Sequelize, Op } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.createTable("InterswitchBills", {
			id: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
			amount: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reference: {
				type: DataTypes.STRING,
				unique: false,
			},
			transRef: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			biller: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			service: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			customerId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'PENDING',
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			participantId: {
				type: DataTypes.STRING,
				allowNull: true,
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
		await queryInterface.dropTable("InterswitchBills");
	},
};
