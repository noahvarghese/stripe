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
    confirmCode?: number;
    subscriptionId?: string;
    customerId?: string;
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
    public confirmCode?: number;
    public subscriptionId?: string;
    public customerId?: string;
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
        confirmCode: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        subscriptionId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        customerId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
    }
);

// Add admin user
(async () => {
    const admin: User | null  = User.build({
            firstName: "Admin",
            lastName: "Admin",
            email: "admin@app.com",
            hash: "admin",
            birthDate: new Date(),
            phone: 9999999999,
            admin: true,
            accountConfirmed: true,    
        });

    const user: User | null = User.build({
        firstName: "Noah",
        lastName: "Varghese",
        email: "varghese.noah@gmail.com",
        hash: "password",
        birthDate: new Date(),
        phone: 6477715777,
        admin: false,
        accountConfirmed: true,
    });

    await sequelize.sync();

    if (! await User.findOne({ where: { email: admin?.email}})) {
        if ( await admin.save() ) {
            console.log("Admin user created.");
        }
    }

    if (! await User.findOne({ where: { email: user?.email}})) {
        if ( await user.save() ) {
            console.log("User user created.");
        }
    }
})();
