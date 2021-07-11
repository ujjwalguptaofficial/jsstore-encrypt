import { jsstoreEncryptMiddleware } from "../dist/middleware.commonjs2.min";
export const encryptPlugin = {
    setup(connection, url) {
        console.log("jsstoreEncryptMiddleware", jsstoreEncryptMiddleware);
        debugger;
        const urls: any[] = [];
        if (connection.isWorker) {
            if (!url) return;
            if (typeof url === "string") {
                urls.push(url as string);
            }
            const blob = new Blob([jsstoreEncryptMiddleware.toString()], { type: "application/javascript; charset=utf-8" });
            const blobUrl = URL.createObjectURL(blob);
            urls.push(blobUrl);
        }

        return connection.importScripts(...urls).then(function () {
            return connection.addMiddleware("jsstoreEncryptMiddleware", true);
        })
    }
}

export default encryptPlugin;