import { DataTypes, QueryInterface, Sequelize, Op } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.createTable("PaystackCollections", {
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
			reference: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			date: {
				type: DataTypes.STRING,
				defaultValue: 0,
				allowNull: false,
			},
			accessCode: {
				type: DataTypes.STRING,
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
		await queryInterface.dropTable("PaystackCollections");
	},
};
