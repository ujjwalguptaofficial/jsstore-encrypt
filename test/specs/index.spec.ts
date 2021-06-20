import { initJsStore } from "../code/src/index";

import { expect } from "chai";
import { idbCon } from "../code/src/storage_service/idb_helper";
import { Student } from "../code/src/model/student";

describe("Encrypt decrypt value", () => {
    it("init connection", () => {
        return initJsStore().then(results => {
            expect(results[2]).equal(true);
            return new Promise((res) => {
                setTimeout(res, 2000);
            })
        })
    })

    it("insert data", () => {
        return idbCon.insert({
            into: "Students",
            encrypt: true,
            values: [{
                city: "bangalore",
                country: "india",
                gender: "male",
                name: "ujjwal",
                secret: "i want to travel the world"
            } as Student]
        } as any).then(results => {
            expect(results).equal(1);
        })
    })

    it("select data", () => {
        return idbCon.select({
            from: "Students",
            decrypt: true,
        } as any).then(results => {
            expect(results).length(1);
        })
    })
})