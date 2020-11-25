import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { config } from "../SQLiteConfig";

const sequelize = new Sequelize(
    config.storage!,
    config.username!,
    config.password,
    config
);

interface UserAttributes {
    ID: number;
    firstName: string;
    lastName: string;
    email: string;
    hash: string;
    birthDate: Date;
    phone: number;
    admin?: boolean;
    accountConfirmed: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, "ID"> {}

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    // set initital values so that keys can be obtained
    public ID!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public hash!: string;
    public birthDate!: Date;
    public phone!: number;
    public admin?: boolean;
    public accountConfirmed!: boolean;
}

User.init(
    {
        ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        phone: {
            type: DataTypes.NUMBER,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        accountConfirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize,
    }
);

// Add admin user
(async () => {
    await sequelize.sync();
    const user = await User.findOne({ where: { email: "admin@admin.com" } });

    if (!user) {
        const admin = await User.create({
            firstName: "Admin",
            lastName: "Admin",
            email: "admin@admin.com",
            hash: "password",
            birthDate: new Date(),
            phone: 9999999999,
            admin: true,
            accountConfirmed: true,
        });
        if (admin) {
            console.log("Admin user created.");
        }
    }
})();
