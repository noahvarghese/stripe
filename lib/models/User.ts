import AbstractModel from "./AbstractModel";

export class User implements AbstractModel {
    // set initital values so that keys can be obtained
    ID?: number;
    firstName: string;
    lastName?: string;
    email?: string;
    password?: string;
    hash?: string;
    birthDate?: Date;
    phone?: number;

    constructor() {
        this.ID = -1;
        this.firstName = "";
        this.lastName = "";
        this.email = "";
        this.password = "";
        this.hash = "";
        this.birthDate = new Date(8640000000000000);
        this.phone = -1;
    }

    getKeys = () => Object.keys(this);

    getListKeys = () => [];
}
