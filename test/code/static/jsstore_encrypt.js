importScripts("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js")
var secret = "secret";
var JsStoreEncrypt = {
    encrypt(message) {
        const data = CryptoJS.AES.encrypt(message, secret).toString();
        console.log("data", data);
        return data;
    },
    decrypt(message) {
        var decryptedBytes = CryptoJS.AES.decrypt(message, secret);
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
}