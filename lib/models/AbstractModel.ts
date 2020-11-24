export default interface AbstractModel {
    ID?: number;
    getProperties: () => { Name: string; Type: string }[];
    getKeys: () => { Name: string; Type: string }[];
    getListKeys: () => { Name: string; Type: string }[];
}

export const isInstanceOfAbstractModel = (object: any) => {
    let isInstance = true;
    const props = ["getKeys", "getProperties", "getListKeys"];
    props.forEach((prop) => {
        if (!Object.keys(object).includes(prop)) {
            isInstance = false;
        }
    });
    return isInstance;
};
