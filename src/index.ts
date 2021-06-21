import { IInsertQuery, ISelectQuery, IColumnOption } from 'jsstore';
declare var JsStoreEncrypt;

declare module "jsstore" {
    interface IColumnOption {
        encrypt?: boolean
    }
    interface ISelectQuery {
        decrypt?: boolean;
    }
    interface IInsertQuery {
        encrypt?: boolean
    }
}

function encryptMiddleware(request, context) {
    const query = request.query;
    const db = context.database;
    const requestName = request.name;
    if (requestName === "insert") {
        if (!query.encrypt) return;
        const table = db.tables.find(q => q.name === query.into);
        const columns = table.columns;
        return Promise.all(
            query.values.map(function (value) {
                const promises = [];
                const columnNames = [];
                for (const columnName in value) {
                    const columnValue = value[columnName];
                    if (columnValue != null && columns[columnName].encrypt) {
                        let promiseResult = JsStoreEncrypt.encrypt(columnValue)
                        if (!promiseResult || !promiseResult.then) {
                            promiseResult = Promise.resolve(promiseResult);
                        }
                        columnNames.push(columnName);
                        promises.push(promiseResult);
                    }
                }
                return Promise.all(promises).then(columnsValue => {
                    let obj = {};
                    columnsValue.forEach((item, index) => {
                        obj[columnNames[index]] = item;
                    });
                    obj = Object.assign(value, obj)
                    return obj;
                })
            })
        );
    }

    if (requestName === "select") {
        if (!query.decrypt) return;
        const table = db.tables.find(q => q.name === query.from);
        const columns = table.columns;
        request.onResult((result) => {
            return Promise.all(
                result.map(function (value) {
                    const promises = [];
                    const columnNames = [];
                    for (const columnName in value) {
                        const columnValue = value[columnName];
                        if (columnValue != null && columns[columnName].encrypt) {
                            let promiseResult = JsStoreEncrypt.decrypt(columnValue)
                            if (!promiseResult || !promiseResult.then) {
                                promiseResult = Promise.resolve(promiseResult);
                            }
                            columnNames.push(columnName);
                            promises.push(promiseResult);
                        }
                    }
                    return Promise.all(promises).then(columnsValue => {
                        let obj = {};
                        columnsValue.forEach((item, index) => {
                            obj[columnNames[index]] = item;
                        });
                        obj = Object.assign(value, obj)
                        return obj;
                    })
                })
            );
        })
    }

};
export const encryptPlugin = {
    setup(connection, url) {
        const blob = new Blob([encryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        return connection.importScripts(blobUrl).then(function () {
            return connection.addMiddleware("encryptMiddleware", true);
        })
    }
}

export default encryptPlugin;