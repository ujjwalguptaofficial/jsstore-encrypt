
import { expect } from "chai";
import { initJsStore, idbCon } from "../src";

describe("Encrypt decrypt value", () => {
    it("init connection", () => {
        return initJsStore().then(results => {
            expect(results[2]).equal(true);
            // return new Promise((res) => {
            //     setTimeout(res, 2000);
            // })
        })
    })

    it("insert data with encrypt", () => {
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

    it("insert data without encrypt", () => {
        return idbCon.insert({
            into: "Students",
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

    it("select data without decrypt", () => {
        return idbCon.select({
            from: "Students",
        } as any).then((results: any[]) => {
            expect(results).length(2);
            expect(results[0].secret).not.equal("i want to travel the world");
            expect(results[1].secret).equal("i want to travel the world");
        })
    })


    it("select data with decrypt", () => {
        return idbCon.select({
            from: "Students",
            decrypt: true,
        } as any).then((results: any[]) => {
            expect(results).length(2);
            expect(results[0].secret).equal("i want to travel the world");
            expect(results[1].secret).not.equal("i want to travel the world");
        })
    })




})