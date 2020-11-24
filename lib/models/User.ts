import e from "express";
import AbstractModel from "./AbstractModel";

export class User implements AbstractModel {
    // set initital values so that keys can be obtained
    ID?: number = -1;
    firstName: string = "";
    lastName?: string = "";
    email?: string = "";
    hash?: string = "";
    birthDate?: Date = new Date(8640000000000000);
    phone?: number = -1;

    constructor() {}

    getProperties = (): { Name: string; Type: string }[] =>
        Object.entries(this)
            .filter(([key, _], __: any) =>
                !["getProperties", "getKeys", "getListKeys"].includes(key)
                    ? true
                    : false
            )
            .map(([key, value], ___: number) => {
                let type: string = typeof value;
                // console.log(`Key: ${key}, Type: ${type}, Value: ${value}`);

                if (type === "number") {
                    if (value % 1 === 0) {
                        type = "int";
                    } else {
                        type = "float";
                    }
                }

                if (type === "object") {
                    console.log(value instanceof Date);
                    if (value instanceof Date) {
                        type = "date";
                    }
                }

                return {
                    Name: key,
                    Type: type,
                };
            });

    getKeys = (): { Name: string; Type: string }[] => {
        return [
            { Name: "ID", Type: "number" },
            { Name: "email", Type: "string" },
        ];
    };

    getListKeys = () => [];
}
