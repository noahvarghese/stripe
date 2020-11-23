import e from "express";
import AbstractModel from "./AbstractModel";

export class User implements AbstractModel {
    // set initital values so that keys can be obtained
    ID?: number = -1;
    firstName: string = "";
    lastName?: string = "";
    email?: string = "";
    password?: string = "";
    hash?: string = "";
    birthDate?: Date = new Date(8640000000000000);
    phone?: number = -1;

    constructor() {}

    getKeys = (): any[] =>
        Object.keys(this).map((key: string, value: any) => {
            let type: string = typeof value;
            console.log(`Key: ${key}, Type: ${type}, Value: ${value}`);

            if (type === "number") {
                if (value % 1 === 0) {
                    type = "int";
                } else {
                    type = "float";
                }
            }

            if (type === "object") {
                if (value instanceof Date) {
                    type = "date";
                }
            }

            return {
                Name: key,
                Type: type,
            };
        });

    getListKeys = () => [];
}
