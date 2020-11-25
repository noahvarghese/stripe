import {Sequelize, Model, DataTypes, Optional} from "sequelize";
import AbstractModel from "./AbstractModel";

const sequelize = new Sequelize('sqlite::memory');

interface UserAttributes {
    ID: number;
    firstName: string;
    lastName: string;
    email: string;
    hash: string;
    birthDate: Date;
    phone: number;
}

interface USerCreationAttributes extends Optional<UserAttributes, "ID"> {}

export class User extends Model<UserAttributes, USerCreationAttributes> implements UserAttributes {
    // set initital values so that keys can be obtained
    public ID!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public hash!: string;
    public birthDate!: Date;
    public phone!: number;
}

User.init({
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
        type: DataTypes.STRING,
        allowNull: false,    
    },
    phone: {
        type: DataTypes.NUMBER,
        allowNull: false,    
    }
}, {
    tableName: "Users",
    sequelize
});
 
sequelize.sync({ force: true });