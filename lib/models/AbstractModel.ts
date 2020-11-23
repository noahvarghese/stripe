export default interface AbstractModel {
    ID?: number;
    getKeys: () => string[];
    getListKeys: () => string[];
}
