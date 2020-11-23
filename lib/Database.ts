/**
 * StAuth10065: I Noah Varghese, 000753196 certify that this material is my original work.
 * No other person's work has been used without due acknowledgment.
 * I have not made my work available to anyone else
 */

import sqlite3 from "sqlite3";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../.env" });

export class Database {
    dbFile: string;

    constructor(init = false) {
        // Load environment variables in
        dotenv.config();

        // get database path from environment vaiables;
        this.dbFile = process.env.PATH_TO_DB!;

        if (init) {
            // Check if database file has been created
            try {
                if (fs.existsSync(this.dbFile)) {
                    // Delete database file so we have a fresh start each time
                    fs.unlinkSync(this.dbFile);
                    this.createDB();
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    open() {
        return new sqlite3.Database(this.dbFile);
    }

    createDB() {
        const db = this.open();

        db.serialize(() => {
            db.run(
                "CREATE TABLE entries ( msgid INTEGER NOT NULL PRIMARY KEY, status TEXT NOT NULL, message TEXT NOT NULL, timestamp TEXT NOT NULL);"
            );
        });
        this.close(db);
    }

    async getModel(id: number) {
        return new Promise((resolve, _) => {
            const db = this.open();
            let returnMessage = "";
            db.serialize(() => {
                db.each(
                    "SELECT * FROM entries WHERE msgid = ?",
                    [id],
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
