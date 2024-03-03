import type { BlockType } from "./types";

//any block can throw this error and its metadata will be attached by the engine

export class BlockError extends Error {
    private block: BlockType | undefined;

    constructor(message?: string, opts?: ErrorOptions) {
        super(message, opts)
    }

    public getMessage() {
        return this.message;
    }

    public getBlock() {
        return this.block;
    }

    public setBlock(block: BlockType) {
        this.block = block;

        return this;
    }
}