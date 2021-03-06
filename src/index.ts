import { jsstoreEncryptMiddleware } from "./middleware";
import {
    IInsertQuery,
    ISelectQuery,
    IColumnOption,
    IUpdateQuery,
    IRemoveQuery,
    IWhereQuery,
    QUERY_OPTION,
    DATA_TYPE
} from 'jsstore';

declare module "jsstore" {
    interface IColumnOption {
        encrypt?: boolean
    }
    interface ISelectQuery {
        decrypt?: boolean  | {where?: IWhereQuery | IWhereQuery[]};
    }
    interface IInsertQuery {
        encrypt?: boolean
    }
    interface IUpdateQuery {
        encrypt?: boolean
    }
    interface IRemoveQuery {
        decrypt?: boolean | {where?: IWhereQuery | IWhereQuery[]};
    }
}
export const encryptPlugin = {
    setup(connection, url) {
        const urls: any[] = [];
        if (connection.isWorker) {
            if (url) {
                if (typeof url === "string") {
                    urls.push(url as string);
                }
            }
            const blob = new Blob([jsstoreEncryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
            const blobUrl = URL.createObjectURL(blob);
            urls.push(blobUrl);
        }
        return connection.importScripts(...urls).then(function () {
            return connection.addMiddleware(jsstoreEncryptMiddleware.name, true);
        })
    }
}

export default encryptPlugin;
