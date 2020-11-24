import path from "path";
import * as dotenv from "dotenv";
dotenv.config();
import { Options } from "sequelize/types";

export const config: Options = {
        username: 'root',
        password: 'root',
        storage: path.join(__dirname, '..', 'api.db'),
        host: 'localhost',
        dialect: "sqlite",
        logging: console.log,
}