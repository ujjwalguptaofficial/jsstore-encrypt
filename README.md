# INTRODUCTION

Encrypt your data when storing &amp; decrypt when fetching in IndexedDB

# Install

```
npm i jsstore-encrypt
```

# How to use

## Setup

### 1. Register plugin

```
import { encryptPlugin } from "jsstore-encrypt";

var connection = new JsStore.Connection();
connection.addPlugin(encryptPlugin);
```

### 2. Create your encrypt decrypt method

```
importScripts("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js")
var secret = "secret";

var JsStoreEncrypt = {
    encrypt(message) {
       return CryptoJS.AES.encrypt(message, secret).toString();
    },
    decrypt(message) {
        var decryptedBytes = CryptoJS.AES.decrypt(message, secret);
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
}
```

save this code in a javascript file. Let's say we have saved inside file name - `jsstore-encrypt.js`

#### Important points -

* Above code uses cryptojs AES algorithm. But you can use any library or algorithm.
* If your code is asychronous, you can return promise.

### 3. Register jsstore-encrypt.js 

```
connection.importScripts("jsstore_encrypt.js"),
```

### 4. Create db schema & mark columns to encrypt

```
const tblStudent = {
    name: 'Students',
    columns: {
        id: {
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            notNull: true,
            dataType: DATA_TYPE.String
        },
        gender: {
            dataType: DATA_TYPE.String,
            default: 'male'
        },
        country: {
            notNull: true,
            dataType: DATA_TYPE.String
        },
        city: {
            dataType: DATA_TYPE.String,
            notNull: true
        },
        secret: {
            dataType: DATA_TYPE.String,
            encrypt: true
        } as any
    }
};
const dataBase: IDataBase = {
    name: dbname,
    tables: [tblStudent]
};
```

In the above schema, column `secret` is marked to be encrypted. So only column secret will be encrypted. 

## Encrypt data when storing

```
connection.insert({
    into: "Students",
    values: [{
        city: "bangalore",
        country: "india",
        gender: "male",
        name: "ujjwal",
        secret: "i want to travel the world"
    }],
    encrypt:true
})
```

## Decrypt data when fetching

```
connection.select({
    from: "Students",
    decrypt: true,
})
```