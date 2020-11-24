/**
 * StAuth10065: I Noah Varghese, 000753196 certify that this material is my original work.
 * No other person's work has been used without due acknowledgment.
 * I have not made my work available to anyone else
 */

import sqlite3 from "sqlite3";
import fs from "fs";
import { Models } from "../conf/Models";
import * as dotenv from "dotenv";
import AbstractModel, {
    isInstanceOfAbstractModel,
} from "./models/AbstractModel";

dotenv.config({ path: __dirname + "/../.env" });

export class Database {
    dbFile: string;

    constructor(init = false, file = "api.db", path = `${__dirname}/../`) {
        this.dbFile = path + file;
        if (init) {
            this.createFile();
        }
    }

    createFile = () => {
        try {
            if (fs.existsSync(this.dbFile)) {
                // Delete database file so we have a fresh start each time
                fs.unlinkSync(this.dbFile);
            }
            this.createAndUpgradeDB();
        } catch (err) {
            console.log(err);
        }
    };

    open() {
        return new sqlite3.Database(this.dbFile);
    }

    createAndUpgradeDB = () => {
        // Upgrade not implemented
        const db = this.open();
        let createTable: string = "";

        for (const model of Models()) {
            createTable = `CREATE TABLE IF NOT EXISTS ${model.type} (`;
            const instantiatedModel = new model.class();
            const keys = instantiatedModel.getProperties();
            console.log(keys);
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i].Name;
                const type = keys[i].Type;
                if (key === "ID") {
                    createTable += ` ID INTEGER PRIMARY KEY AUTOINCREMENT`;
                } else if (type === "string") {
                    createTable += ` ${key} TEXT`;
                } else if (type === "float") {
                    createTable += ` ${key} REAL`;
                } else if (type === "int") {
                    createTable += ` ${key} INTEGER`;
                } else if (type === "boolean") {
                    createTable += ` ${key} INTEGER`;
                } else {
                    createTable += ` ${key} TEXT`;
                }

                if (i < keys.length - 1) {
                    createTable += `,`;
                }
            }
            createTable += `);`;
        }
        console.log(createTable);

        db.serialize(() =>
            db.run(createTable, () => {
                this.close(db);
            })
        );
    };

    async selectModel(model: AbstractModel) {
        return new Promise((resolve, _) => {
            const db = this.open();

            let select = "";
            let whereClause = "WHERE";

            const keys: { Name: string; Type: string }[] = model.getKeys();
            console.log(keys);

            const getValue = (property: string) =>
                Object.entries(model).find(([key, _]) => key === property)![1];

            for (let i = 0; i < keys.length; i++) {
                const type = keys[i].Type;
                if (type === "string") {
                    whereClause += ` ${keys[i].Name} = ${getValue(
                        keys[i].Name
                    )}`;
                } else if (type === "boolean") {
                    whereClause += ` ${keys[i].Name} = ${
                        getValue(keys[i].Name) ? 1 : 0
                    }`;
                } else if (type === "date") {
                    whereClause += ` ${keys[i].Name} = ${new Date(
                        getValue(keys[i].Name)
                    ).toString()}`;
                } else {
                    whereClause += ` ${keys[i].Name} = ${getValue(
                        keys[i].Name
                    )}`;
                }

                if (i < keys.length - 1) {
                    whereClause += " AND";
                }
            }
            console.log(whereClause);

            select = "SELECT";
            const properties = model.getProperties();

            for (let i = 0; i < properties.length; i++) {
                const property = properties[i];
                select += ` ${property.Name}`;

                if (i < properties.length - 1) {
                    select += ",";
                }
            }

            select += ` FROM ${model.constructor.name}`;
            const commandTxt = `${select} ${whereClause}`;

            let returnMessage = "";
            db.serialize(() => {
                db.each(
                    "SELECT * FROM entries WHERE  = ?",
                    [],
                    (err, row) => {
                        returnMessage = row;
                    },
                    () => {
                        resolve(returnMessage);
                    }
                );
            });
        });
    }

    async getAll() {
        const db = this.open();

        const entries: any[] = [];
        const errors = "";

        return new Promise((resolve, _) => {
            db.serialize(() => {
                db.each(
                    "SELECT * FROM entries;",
                    (err: any, row: any) => {
                        if (!err) {
                            entries.push(row);
                        } else {
                            console.log(err);
                        }
                    },
                    () => {
                        this.close(db);
                        resolve(entries);
                    }
                );
            });
        });
    }

    upsert(entries: any[]) {
        if (Array.isArray(entries) === false) {
            throw new Error("Must pass in an array of data.");
        }

        if (entries.length < 1) {
            throw new Error("No data provided.");
        }

        return new Promise((resolve, _) => {
            const responseMessages: any[] = [];
            const commandCount = 0;

            const db = this.open();
            const sqlCommands = new Array(entries.length);
            const sqlValues = new Array(entries.length);

            db.serialize(() => {
                for (let i = 0; i < entries.length; i++) {
                    const paramCount = Object.keys(entries[i]).length;
                    let count = 0;
                    const preparedValues: any[] = [];
                    let sqlStatement = "";

                    // checks that there is an object with that id
                    db.each(
                        "SELECT COUNT(*) as count FROM entries WHERE msgid = ?;",
                        [entries[i].msgid],
                        (err, row) => {
                            if (err) {
                                responseMessages.push(err);
                            } else {
                                // if entry exists and there are parameters other than the id
                                // update
                                if (row.count > 0 && paramCount > 1) {
                                    sqlStatement = "UPDATE entries SET ";
                                    let setQuery = "";

                                    for (const key in entries[i]) {
                                        if (entries[i].hasOwnProperty(key)) {
                                            count++;

                                            if (key !== "msgid") {
                                                setQuery += `${key} = ?`;

                                                preparedValues.push(
                                                    entries[i][key]
                                                );

                                                if (paramCount === 2) {
                                                    // account for msgid being set, we do not want to update that so will not be added
                                                    if (
                                                        count <
                                                        paramCount - 1
                                                    ) {
                                                        setQuery += ", ";
                                                    }
                                                } else {
                                                    if (count < paramCount) {
                                                        setQuery += ", ";
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    sqlStatement += `${setQuery} WHERE msgid = ?;`;
                                    preparedValues.push(entries[i].msgid);
                                }
                                // otherwise insert
                                else {
                                    sqlStatement = "INSERT INTO entries (";
                                    let columnQuery = "";
                                    const placeholders = [];

                                    for (const key in entries[i]) {
                                        if (entries[i].hasOwnProperty(key)) {
                                            // Extra check because we don;t know which part of the if statement will fail
                                            // We want it to default to inserting a new record if none of the checks pass
                                            // But do not want to insert a unique id, let the database create it

                                            count++;

                                            columnQuery += key;
                                            placeholders.push("?");
                                            preparedValues.push(
                                                entries[i][key]
                                            );

                                            if (count < paramCount) {
                                                columnQuery += ", ";
                                            }
                                        }
                                    }

                                    sqlStatement += `${columnQuery}) VALUES (${placeholders.join(
                                        ", "
                                    )});`;
                                }

                                sqlCommands[i] = sqlStatement;
                                sqlValues[i] = preparedValues;
                            }
                        },
                        () => {
                            let empty = false;
                            for (const command of sqlCommands) {
                                if (command == null) {
                                    empty = true;
                                }
                            }

                            if (!empty) {
                                for (const command of sqlCommands) {
                                    const index = sqlCommands.indexOf(command);
                                    db.each(
                                        command,
                                        sqlValues[index],
                                        (err: any) => {
                                            console.log(err);
                                            if (err) {
                                                responseMessages.push(err);
                                            }
                                        },
                                        () => {
                                            if (
                                                command ===
                                                sqlCommands[
                                                    sqlCommands.length - 1
                                                ]
                                            ) {
                                                db.close();
                                                resolve(responseMessages);
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                }
            });
        });
    }

    delete(id = null) {
        return new Promise((resolve, _) => {
            const db = this.open();

            const responseMessages: any[] = [];

            let query = "DELETE FROM entries";
            const params = [];

            if (id) {
                query += " WHERE msgid = ?";
                params.push(id);
            }

            query += ";";

            db.each(
                query,
                params,
                (err: any) => {
                    if (err) {
                        responseMessages.push(err);
                    }
                },
                () => {
                    db.close();
                    resolve(responseMessages);
                }
            );
        });
    }

    close(db: sqlite3.Database) {
        db.close();
    }
}
