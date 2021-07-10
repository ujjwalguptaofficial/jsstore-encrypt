import { IInsertQuery, ISelectQuery, IColumnOption, IUpdateQuery, QUERY_OPTION } from 'jsstore';
import { WhereEncrypter } from './where_encrypter';
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

export function jsstoreEncryptMiddleware(request, context) {
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
        const where = query.where;
        if (where) {
            debugger;
            // request.beforeExecute(_ => {
            new WhereEncrypter(where).encrypt(columns);
            // })
        }
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