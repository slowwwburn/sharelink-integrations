import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import createLogger from "../../utils/Logger";
import Util from "../../utils/Util";

const log = createLogger(__filename);
const util = new Util();

export interface InterswitchBillAttributes {
	id?: number;
	amount?: string;
	reference?: string;
  transRef?: string;
	type?: string;
	biller?: string;
	service?: string;
	customerId?: string;
	status?: string;
	userId?: string;
	participantId?: string;
}

class InterswitchBill
	extends Model<InterswitchBillAttributes>
	implements InterswitchBillAttributes
{
	public id?: number;
	public amount?: string;
	public reference?: string;
  public transRef?: string;
	public type?: string;
	public biller?: string;
	public service?: string;
	public customerId?: string;
	public status?: string;
	public userId?: string;
	public participantId?: string;

	// Timestamps (automatically handled by Sequelize if enabled)
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Define associations
	static associate(models: any) {
		// Campaign.hasOne(models.User);
	}
}

const initModel = (sequelize: Sequelize): typeof InterswitchBill => {
	InterswitchBill.init(
		{
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
				unique: false,
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
		},
		{
			sequelize,
			modelName: "InterswitchBill",
			tableName: "InterswitchBills",
			timestamps: true,
		}
	);

	return InterswitchBill;
};

export default initModel;
