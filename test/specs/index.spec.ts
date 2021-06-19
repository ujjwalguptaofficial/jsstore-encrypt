import { initJsStore } from "../code/src/index";

import { expect } from "chai";

describe("Encrypt decrypt value", () => {
    it("init connection", () => {
        return initJsStore().then(results => {
            expect(results[2]).equal(true);
        })
    })
})