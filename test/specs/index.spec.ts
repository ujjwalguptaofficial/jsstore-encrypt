
import { expect } from "chai";
import { initJsStore, idbCon } from "../src";

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
            }]
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