export default class AbstractModel {
    ID;
    constructor() {
        if (this.constructor === AbstractModel) {
            throw new TypeError("Abstract class \"AbstractModel\" cannot be instantiated directly");
        }

        if (this.getKeys === undefined) {
            throw new TypeError("Classes extending the AbstractModel must implement method getKeys");
        }

        if (this.getListKeys === undefined) {
            throw new TypeError("Classes extending the AbstractModel must implement method getListKeys");
        }
    }

    // getKeys() {
    // 
    //     return new []
    // }
}