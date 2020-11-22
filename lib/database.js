/**
 * StAuth10065: I Noah Varghese, 000753196 certify that this material is my original work.
 * No other person's work has been used without due acknowledgment.
 * I have not made my work available to anyone else
 */

const sqlite3 = require('sqlite3');
const fs = require('fs');
require('dotenv').config();

export class database {

    constructor(init = false) {

        // Load environment variables in
        dotenv.config();

        // get database path from environment vaiables;
        this.dbFile = process.env.PATH_TO_DB;

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
        const db = this.open()
        db.serialize(() => {
            db.run(
                "CREATE TABLE entries ( msgid INTEGER NOT NULL PRIMARY KEY, status TEXT NOT NULL, message TEXT NOT NULL, timestamp TEXT NOT NULL);"
            );
        });
        this.close(db);
    }

    async getModel(id) {

        return new Promise((resolve, _) => {
            const db = this.open();
            let returnMessage = "";
            db.serialize(() => {
                db.each("SELECT * FROM entries WHERE msgid = ?", [id], (err, row) => {
                    returnMessage = row;
                }, () => {
                    resolve(returnMessage);
                });
            });
        });
    }


    async getAll() {

        const db = this.open();

        let entries = [];
        let errors = "";

        return new Promise((resolve, _) => {
            db.serialize(() => {
                db.each("SELECT * FROM entries;", (err, row) => {
                    if (!err) {
                        entries.push(row);
                    } else {
                        console.log(err);
                    }
                }, () => {
                    this.close(db);
                    resolve(entries);
                });
            });
        });
    }

    upsert(entries) {

        if (Array.isArray(entries) === false) {
            throw new Error("Must pass in an array of data.");
        }

        if (entries.length < 1) {
            throw new Error("No data provided.");
        }

        return new Promise((resolve, _) => {
            let responseMessages = [];
            let commandCount = 0;

            const db = this.open();
            let sqlCommands = new Array(entries.length);
            let sqlValues = new Array(entries.length);

            db.serialize(() => {
                for (let i = 0; i < entries.length; i++) {

                    const paramCount = Object.keys(entries[i]).length;
                    let count = 0;
                    let preparedValues = [];
                    let sqlStatement = "";

                    // checks that there is an object with that id
                    db.each("SELECT COUNT(*) as count FROM entries WHERE msgid = ?;", [entries[i].msgid], (err, row) => {

                        if (err) {
                            responseMessages.push(err);
                        } else {
                            // if entry exists and there are parameters other than the id
                            // update
                            if (row.count > 0 && paramCount > 1) {

                                sqlStatement = "UPDATE entries SET ";
                                let setQuery = "";

                                for (const key in entries[i]) {

                                    count++;

                                    if (key !== 'msgid') {

                                        setQuery += `${key} = ?`;

                                        preparedValues.push(entries[i][key]);

                                        if (paramCount === 2) {
                                            // account for msgid being set, we do not want to update that so will not be added
                                            if (count < paramCount - 1) {
                                                setQuery += ", ";
                                            }
                                        } else {
                                            if (count < paramCount) {
                                                setQuery += ", ";
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
                                let placeholders = [];

                                for (const key in entries[i]) {

                                    // Extra check because we don;t know which part of the if statement will fail
                                    // We want it to default to inserting a new record if none of the checks pass
                                    // But do not want to insert a unique id, let the database create it

                                    count++;

                                    columnQuery += key;
                                    placeholders.push("?");
                                    preparedValues.push(entries[i][key]);

                                    if (count < paramCount) {
                                        columnQuery += ", ";
                                    }
                                }

                                sqlStatement += `${columnQuery}) VALUES (${placeholders.join(", ")});`;
                            }


                            sqlCommands[i] = sqlStatement;
                            sqlValues[i] = preparedValues;
                        }
                    }, () => {
                        let empty = false;
                        for (let i = 0; i < sqlCommands.length; i++) {
                            if (sqlCommands[i] == null) {
                                empty = true;
                            }
                        }

                        if (!empty) {

                            for (let i = 0; i < sqlCommands.length; i++) {
                                db.each(sqlCommands[i], sqlValues[i], err => {
                                    console.log(err);
                                    if (err) {
                                        responseMessages.push(err);
                                    }
                                }, () => {
                                    if (i === sqlCommands.length - 1) {
                                        db.close();
                                        resolve(responseMessages);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

    }


    delete(id = null) {

        return new Promise((resolve, _) => {

            const db = this.open();

            let responseMessages = [];

            let query = "DELETE FROM entries";
            let params = [];

            if (id) {
                query += " WHERE msgid = ?";
                params.push(id);
            }

            query += ";";

            db.each(query, params, (err) => {
                if (err) {
                    responseMessages.push(err);
                }
            }, () => {
                db.close();
                resolve(responseMessages);
            });
        });
    }

    close(db) {
        db.close();
    }
}