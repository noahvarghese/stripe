import {Sequelize, DataTypes} from "sequelize";
import AbstractModel from "./AbstractModel";

const sequelize = new Sequelize('sqlite::memory');

export const User = sequelize.define("User", {
    // set initital values so that keys can be obtained
    ID: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    phone: {
        type: DataTypes.NUMBER,
        allowNull: false
    }
});