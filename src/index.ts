import { jsstoreEncryptMiddleware } from "./middleware";

export const encryptPlugin = {
    setup(connection, url) {
        const urls: any[] = [];
        if (connection.isWorker) {
            if (!url) return;
            if (typeof url === "string") {
                urls.push(url as string);
            }
            else if (typeof url === "function") {
                const blob = new Blob([jsstoreEncryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
                const blobUrl = URL.createObjectURL(blob);
                urls.push(blobUrl);
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