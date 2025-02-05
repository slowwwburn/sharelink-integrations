import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import createLogger from "../../utils/Logger";
import Util from "../../utils/Util";

const log = createLogger(__filename);
const util = new Util();

// Define the Campaign model attributes interface
export interface PaystackTransferAttributes {
	id?: number;
	amount?: string;
	beneficiary?: string;
	beneficiaryAccount?: string;
	bankCode?: string;
	userId?: string;
	reference?: string;
	recipientCode?: string;
	status?: string;
	date?: string;
}

// Define the Campaign model class
class Campaign
	extends Model<PaystackTransferAttributes>
	implements PaystackTransferAttributes
{
	public id?: number;
	public amount?: string;
	public beneficiary?: string;
	public beneficiaryAccount?: string;
	public bankCode?: string;
	public userId?: string;
	public reference?: string;
	public recipientCode?: string;
	public status?: string;
	public date?: string;

	// Timestamps (automatically handled by Sequelize if enabled)
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Define associations
	static associate(models: any) {
		// Campaign.hasOne(models.User);
	}
}

// Initialize the Campaign model
const initModel = (sequelize: Sequelize): typeof Campaign => {
	Campaign.init(
		{
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
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			date: {
				type: DataTypes.DATE,
				defaultValue: 0,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "PaystackTransfer",
			tableName: "PaystackTransfers",
			timestamps: true, // Enable createdAt and updatedAt
		}
	);

	return Campaign;
};

export default initModel;
