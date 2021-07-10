declare var JsStoreEncrypt;


export const encryptValue = (value: string) => {
    return JsStoreEncrypt.encrypt(value);
}

export const decryptValue = (value: string) => {
    return JsStoreEncrypt.decrypt(value);
}