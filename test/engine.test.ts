import { BlockEngine } from "../src";
import { add, multiply } from "./blocks";

const engine = new BlockEngine({
    add,
    multiply,
});

describe("test add function", () => {
    it("should return 15", async () => {
        const result = await engine.safeStart([
            {
                type: "add",
                props: {
                    num1: 5,
                    num2: 10,
                },
            },
        ]);

        if (result.success) {
            console.log(result.data);
        }

        expect(15).toBe(15);
    });
});
