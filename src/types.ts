import type { BlockEngine } from "./engine";

export type BlockType<T = any> = {
    id: string,
    type: T,
    props?: any,
    blocks?: Array<BlockType<T>>
}

export type BlockTypeWithBlocks<T = any> = BlockType<T> & {
    blocks: Array<BlockType<T>>
}

export type BlockContext<T = any, B extends BlockType = BlockType<T>> = { 
    engine: BlockEngine, 
    block: B, 
    // index: number,
};

export type BlockFn<T = any, B extends BlockType = BlockType<T>> = (props: T, context: BlockContext<T, B>) => void;
export type BlockFnFactory = { factory: (() => BlockFn | Promise<BlockFn>) }

export type BlockParams<T = any, B extends BlockType = BlockType<T>> = Parameters<BlockFn<T, B>>;
export type BlockMap<T extends string = any> = Record<T, BlockFn>;

//figure out service lifecycle further
export interface IService<T = any, B extends BlockType = BlockType<T>> {
    onBeforeBlock?(ctx: BlockContext<T, B>): void,
    onAfterBlock?(ctx: BlockContext<T, B>): void,
    onTransition?(ctx: BlockContext<T, B> & { next: BlockType<T> }): void
}

export type FlowType<T extends BlockType = BlockType> = {
    blocks: Array<T>
}