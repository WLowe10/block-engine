import { BlockEngine } from "../src";
import { add, multiply } from "./blocks";

const engine = new BlockEngine({
    add,
    multiply,
});

describe("test add function", () => {
    it("should return 15 for add(10,5)", () => {
        expect(15).toBe(15);
    });
});
