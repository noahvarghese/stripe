import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { Options } from "sequelize/types";
import { Sequelize } from "sequelize";

const config: Options = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    storage: path.join(__dirname, "..", "api.db"),
    host: "localhost",
    dialect: "sqlite",
    logging: console.log,
};

export default new Sequelize(config.storage!, config.username!, config.password, config);