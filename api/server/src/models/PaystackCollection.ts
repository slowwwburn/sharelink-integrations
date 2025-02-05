import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import createLogger from "../../utils/Logger";
import Util from "../../utils/Util";

const log = createLogger(__filename);
const util = new Util();

// Define the Campaign model attributes interface
export interface PaystackCollectionAttributes {
	id?: number;
	amount?: string;
	reference?: string;
	userId?: string;
	email?: string;
	status?: string;
	date?: string;
	accessCode?: string;
}

// Define the Campaign model class
class PaystackCollection
	extends Model<PaystackCollectionAttributes>
	implements PaystackCollectionAttributes
{
	public id?: number;
	public amount?: string;
	public reference?: string;
	public userId?: string;
	public email?: string;
	public status?: string;
	public date?: string;
	public accessCode?: string;

	// Timestamps (automatically handled by Sequelize if enabled)
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Define associations
	static associate(models: any) {
		// Campaign.hasOne(models.User);
	}
}

// Initialize the Campaign model
const initModel = (sequelize: Sequelize): typeof PaystackCollection => {
	PaystackCollection.init(
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
		},
		{
			sequelize,
			modelName: "PaystackCollection",
			tableName: "PaystackCollections",
			timestamps: true, // Enable createdAt and updatedAt
		}
	);

	return PaystackCollection;
};

export default initModel;
