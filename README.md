[![npm version](https://badge.fury.io/js/jsstore-encrypt.svg)](https://badge.fury.io/js/jsstore-encrypt)
[![TEST](https://github.com/ujjwalguptaofficial/jsstore-encrypt/actions/workflows/main.yml/badge.svg)](https://github.com/ujjwalguptaofficial/jsstore-encrypt/actions/workflows/main.yml)
# Introduction

Encrypt your data when storing &amp; decrypt when fetching in IndexedDB

It is a jsstore plugin which register a [middleware](https://jsstore.net/tutorial/middleware/). The middleware encrypt or decrypt values based on query. 

# Install

```
npm i jsstore-encrypt
```

# Examples

https://github.com/ujjwalguptaofficial/jsstore-encrypt/tree/main/examples/

# How to use

## Setup

### 1. Define your encrypt decrypt method

```javascript 
importScripts("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js")

var secret = CryptoJS.enc.Hex.parse('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');

var JsStoreEncrypt = {
    encrypt(message) {
        const data = CryptoJS.AES.encrypt(message, secret, { mode: CryptoJS.mode.ECB }).toString();
        console.log("data", data);
        return data;
    },
    decrypt(message) {
        var decryptedBytes = CryptoJS.AES.decrypt(message, secret, { mode: CryptoJS.mode.ECB });
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }
}
```

save this code in a javascript file. Let's say we have saved inside file name - `jsstore-encrypt.js`

This code will be used to encrypt decrypt the value. `jsstore-encrypt` search for object `JsStoreEncrypt` and then use `encrypt`, `decrypt` method, so its important that you follow this pattern.

#### 👉 Important points -

* Above code uses cryptojs AES algorithm. But you can use any library or algorithm.
* If your code is asychronous, you can return promise.
* In order to query using `where` - the encrypt algorithm should generate the same value always, so that we can encrypt a value and search in stored values.

### 2. Register plugin

```javascript 
import { encryptPlugin } from "jsstore-encrypt";

var connection = new JsStore.Connection();
connection.addPlugin(encryptPlugin, "path to jsstore_encrypt.js");
```

### 3. Create db schema & mark columns to encrypt

```javascript 
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

In the above schema, column `secret` is marked to be encrypted. So only column secret will be encrypted when inserted or updated & decrypted when selecting. 

## Insert data

```javascript 
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

The `encrypt` option tells jsstore-encrypt to encrypt the values. Only column marked with `ecnrypt` in the database schema will be encrypted - in our case `secret`.

## Select data

```javascript 
connection.select({
    from: "Students",
    decrypt: true,
})
```

The `decrypt` option tells jsstore-decrypt to decrypt the values. Only column marked with `ecnrypt` will be decrypted - in our case `secret` column only.

## Update data

```javascript 
connection.update({
    in: "Students",
    encrypt: true,
    set:{
        name:'Ujjwal Gupta',
        secret:"Being more human"
    }
})
```

In case of update, `set` values are encrypted.

## Where (Filter)

In order to filter data using `where` - the encrypt algorithm should generate the same value always, so that we can encrypt a value and search in stored values.

```javascript 
connection.select({
    from: "Students",
    decrypt: {
        where:{
          secret:"Being more human"
        }
    }
})
```

When you add `where` inside decrypt/encrypt, all values inside where are encrypted.

👉 You can also use your normal field without encrypt option similar to how you were using before - 

```javascript 
connection.select({
    from: "Students",
    decrypt: {
        where:{
          secret:"Being more human"
        }
    },
    where:{
        id:1
    }
})
```

Note:- Partial where option - `regex`, `like` etc doesn't work in case of encryption as the values are stored as different data.

