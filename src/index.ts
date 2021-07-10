import { IInsertQuery, ISelectQuery, IColumnOption, IUpdateQuery } from 'jsstore';
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
    interface IUpdateQuery {
        encrypt?: boolean
    }
}

function encryptMiddleware(request, context) {
    const query = request.query;
    const db = context.database;
    const requestName = request.name;
    if (["insert", "update"].indexOf(requestName) >= 0 && query.encrypt) {
        const tableName = requestName === "insert" ? query.into : query.in;
        const table = db.tables.find(q => q.name === tableName);
        const columns = table.columns;
        const encryptValue = (value) => {
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
        }
        if (requestName === "insert") {
            return request.beforeExecute(_ => {
                return Promise.all(
                    query.values.map(encryptValue)
                );
            })
        }
        return request.beforeExecute(_ => {
            return encryptValue(query.set);
        })
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
        const urls: any[] = [];
        if (url) {
            if (typeof url === "string") {
                urls.push(url as string);
            }
            else if (typeof url === "function") {
                const blob = new Blob([encryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
                const blobUrl = URL.createObjectURL(blob);
                urls.push(blobUrl);
            }
        }
        const blob = new Blob([encryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
        const blobUrl = URL.createObjectURL(blob);
        urls.push(blobUrl);
        return connection.importScripts(...urls).then(function () {
            return connection.addMiddleware("encryptMiddleware", true);
        })
    }
}

export default encryptPlugin;