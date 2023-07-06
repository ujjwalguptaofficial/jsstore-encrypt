import { DATA_TYPE, QUERY_OPTION } from "jsstore";

declare var JsStoreEncrypt;



export function jsstoreEncryptMiddleware(request, context) {
    const query = request.query || {};
    const encryptDecrypt = query.encrypt || query.decrypt;
    if (!encryptDecrypt) return;
    const where = encryptDecrypt.where;
    function encryptWhere(where: object, columns) {
        const encryptIn = (column) => {
            const encryptInPromises = [];
            (where[column][QUERY_OPTION.In] as any[]).forEach((value, i) => {
                encryptInPromises.push(encryptValue(value).then(v => where[column][QUERY_OPTION.In][i] = v));
            });
            return encryptInPromises;
        }

        const checkComparisionOp_ = (column, symbol) => {
            const compareValue = this.where[column][symbol];
            const checkComparisionOp_Promises = [];
            if (symbol != QUERY_OPTION.Between) {
                checkComparisionOp_Promises.push(encryptValue(compareValue).then(value => where[column][symbol] = value));
            }
            else {
                checkComparisionOp_Promises.push(encryptValue(compareValue.low).then(value => where[column][symbol].low = value));
                checkComparisionOp_Promises.push(encryptValue(compareValue.high).then(value => where[column][symbol].high = value));
            }
            return checkComparisionOp_Promises;
        }

        const promises = [];
        for (let columnName in where) {
            const whereColumnValue = where[columnName];
            const column = columns[columnName];
            if (column == null || !column.encrypt) break;

            if (getDataType(whereColumnValue) === "object") {
                for (const key in whereColumnValue) {

                    switch (key) {
                        case QUERY_OPTION.In:
                            promises.push(encryptIn(columnName));
                            break;
                        case QUERY_OPTION.Between:
                        case QUERY_OPTION.GreaterThan:
                        case QUERY_OPTION.LessThan:
                        case QUERY_OPTION.GreaterThanEqualTo:
                        case QUERY_OPTION.LessThanEqualTo:
                        case QUERY_OPTION.NotEqualTo:
                            promises.push(checkComparisionOp_(columnName, key));
                    }
                }
            }
            else {
                promises.push(encryptValue(whereColumnValue).then(value => where[columnName] = value));
            }
        }
        return Promise.all(promises);
    }
    if (where) {
        request.beforeExecute( _ => {
            return encryptWhere(where, columns)
                .then(() => {
                    query.where = query.where || {};
                    Object.assign(query.where, where);
                });
        })
    }
    const db = context.database;
    const requestName = request.name;
    const encryptValue = (value: string) => {
        let result = JsStoreEncrypt.encrypt(value);
        if (!result || !result.then) {
            result = Promise.resolve(result);
        }
        return result;
    }

    const decryptValue = (value: string) => {
        return JsStoreEncrypt.decrypt(value);
    }

    const getDataType = (value) => {
        if (value == null) {
            return DATA_TYPE.Null;
        }
        const type = typeof value;
        switch (type) {
            case 'object':
                if (Array.isArray(value)) {
                    return DATA_TYPE.Array;
                }
                if (value instanceof Date) {
                    return DATA_TYPE.DateTime;
                }
        }
        return type;
    }

    const tableName = (() => {
        switch (requestName) {
            case "insert":
                return query.into;
            case "update":
                return query.in;
            default:
                return query.from;
        }
    })();
    const table = db.tables.find(q => q.name === tableName);
    const columns = table.columns;
    if (["insert", "update"].indexOf(requestName) >= 0 && query.encrypt) {
        const encryptInsertValue = (value) => {
            const promises = [];
            const columnNames = [];
            for (const columnName in value) {
                const columnValue = value[columnName];
                if (columnValue != null && columns[columnName].encrypt) {
                    let promiseResult = encryptValue(columnValue)
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
                    query.values.map(encryptInsertValue)
                );
            })
        }
        // logic for update
        return request.beforeExecute(_ => {
            return encryptInsertValue(query.set);
        })
    }

    if (requestName === "select" && query.decrypt) {

        request.onResult((result) => {
            return Promise.all(
                result.map(function (value) {
                    const promises = [];
                    const columnNames = [];
                    for (const columnName in value) {
                        const columnValue = value[columnName];
                        if (columnValue != null && columns[columnName].encrypt) {
                            let promiseResult = decryptValue(columnValue)
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

}
