importScripts("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js")
var secret = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

var JsStoreEncrypt = {
    // encrypt(message) {
    //     return encodeURIComponent(message);
    // },
    // decrypt(message) {
    //     return decodeURIComponent(message);
    //     // var decryptedBytes = CryptoJS.AES.decrypt(message, secret);
    //     // return decryptedBytes.toString(CryptoJS.enc.Utf8);
    // }
    encrypt(message) {
        const data = CryptoJS.AES.encrypt(message, secret, { mode: CryptoJS.mode.ECB }).toString();
        // console.log("data", data);
        return new Promise(res => {
            setTimeout(() => {
                res(data);
            }, 100);
        });
    },
    decrypt(message) {
        var decryptedBytes = CryptoJS.AES.decrypt(message, secret, { mode: CryptoJS.mode.ECB });
        const result = decryptedBytes.toString(CryptoJS.enc.Utf8);

        return new Promise(res => {
            setTimeout(() => {
                res(result);
            }, 100);
        });
    }
}