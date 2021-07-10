import { getDataType } from "./utils";
import { QUERY_OPTION } from "jsstore";
import { encryptValue } from "./helpers";

/**
 * For matching the different column value existance for where option
 * 
 * @export
 * @class WhereChecker
 */
export class WhereEncrypter {
    where: object;

    constructor(where: object) {
        this.where = where;
    }

    encrypt(columns) {
        for (let columnName in this.where) {
            const whereColumnValue = this.where[columnName];
            const column = columns[columnName];
            if (column == null || !column.encrypt) break;

            if (getDataType(whereColumnValue) === "object") {
                for (const key in whereColumnValue) {

                    switch (key) {
                        case QUERY_OPTION.In:
                            this.encryptIn(columnName);
                            break;
                        case QUERY_OPTION.Between:
                        case QUERY_OPTION.GreaterThan:
                        case QUERY_OPTION.LessThan:
                        case QUERY_OPTION.GreaterThanEqualTo:
                        case QUERY_OPTION.LessThanEqualTo:
                        case QUERY_OPTION.NotEqualTo:
                            this.checkComparisionOp_(columnName, key);
                    }
                }
            }
            else {
                this.where[columnName] = encryptValue(whereColumnValue);
            }
        }
        return status;
    }

    private encryptIn(column) {
        (this.where[column][QUERY_OPTION.In] as any[]).forEach((value, i) => {
            this.where[column][QUERY_OPTION.In][i] = encryptValue(value)
        });
    }

    private checkComparisionOp_(column, symbol) {
        const compareValue = this.where[column][symbol];
        if (symbol != QUERY_OPTION.Between) {
            this.where[column][symbol] = encryptValue(compareValue);
        }
        else {
            this.where[column][symbol].low = encryptValue(compareValue.low);
            this.where[column][symbol].high = encryptValue(compareValue.high);
        }
    }
}