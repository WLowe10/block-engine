import { BlockError } from "./block-error";
import type {
    FlowType,
    BlockType,
    IService,
    BlockFn,
    BlockFnFactory,
} from "./types";
import { StackFrame } from "./stack-frame";

/**
 * i may choose to add execution contexts again. that would allows an engine to create new contexts that can be started, stopped, and paused
 */

/**
 * todo
 *
 * should the return functionality be a pseudo block?
 * also consider the logic of returns and how they should be implemented
 *
 */

export class BlockEngine<
    T extends Record<string, BlockFn> = Record<string, BlockFn>
> {
    private blockFunctions: Record<keyof T, BlockFn>;
    private services: Array<IService<keyof T>> = [];
    private forks: Array<BlockEngine<T>> = [];
    private stackFrame = new StackFrame();
    private blockIndex = 0;
    private running = false;

    //the build method is there to use with block factories
    static async build(functions: Record<string, BlockFn | BlockFnFactory>) {
        for (const [key, fn] of Object.entries(functions)) {
            if (typeof fn === "object") {
                if (!fn.factory) {
                    throw new Error(
                        "Recieved an object that is not a valid factory"
                    );
                }

                const blockFn = (functions[key] = await fn.factory());

                if (typeof blockFn !== "function") {
                    throw new Error("Factory did not return a function");
                }

                functions[key] = blockFn;
            }
        }

        return new BlockEngine(
            functions as Record<keyof typeof functions, BlockFn>
        );
    }

    constructor(blockFunctions: T) {
        super();
        this.blockFunctions = blockFunctions;
    }

    public isRunning() {
        return this.running;
    }

    public getStackFrame() {
        return this.stackFrame;
    }

    public use(...services: Array<IService<keyof T>>) {
        this.services.push(...services);

        return this;
    }

    public fork() {
        const fork = new BlockEngine(this.blockFunctions);
        const stack = fork.getStackFrame();

        // a forked engine is basically an individual stack frame
        // a fork should have all of the data on the stack from before it, but its stack should be individual
        stack.setParent(this.stackFrame);
        fork.use(...this.services);

        //? figure out forked event emitting, maybe i shouldn't even use an event emitter at all?
        // fork.on

        this.forks.push(fork);

        return fork;
    }

    //!make this typesafe again
    public async start(blocks: BlockType<keyof T>[]) {
        this.running = true;

        while (this.running && this.blockIndex < blocks.length) {
            //copies the block to prevent the strategies from mutating the original data
            const block: any = structuredClone(blocks[this.blockIndex]);
            const nextBlock: any = blocks[this.blockIndex + 1]
                ? structuredClone(blocks[this.blockIndex + 1])
                : null;

            //pseudo block that ends execution and returns the value
            if (block.type === "return") {
                for (const service of this.services) {
                    if (typeof service.onBeforeBlock === "function") {
                        service.onBeforeBlock({
                            block,
                            engine: this,
                        });
                    }
                }

                return block.props.argument;
            }

            const data = await this.executeBlock(block).catch((e) => {
                //if an error is a block error, attach the block to the error
                if (e instanceof BlockError) {
                    if (typeof e.getBlock() === "undefined") {
                        e.setBlock(block);
                    }

                    throw e;
                } else {
                    throw new BlockError(e.message, { cause: e }).setBlock(
                        block
                    );
                }
            });

            this.stackFrame.set(block.id, data);

            for (const service of this.services) {
                if (typeof service.onTransition === "function") {
                    service.onTransition({
                        block: block,
                        next: nextBlock,
                        engine: this,
                    });
                }
            }

            this.blockIndex++;
        }
    }

    //automatically catches the error for you. Returns data like a Result type.
    public async safeStart<T = any>(
        blocks: any[]
    ): Promise<
        { success: true; data: T } | { success: false; error: BlockError }
    > {
        try {
            const data = await this.start(blocks);

            return {
                success: true,
                data: data,
            };
        } catch (e) {
            return {
                success: false,
                error: e as BlockError,
            };
        }
    }

    public stop() {
        this.running = false;
        this.blockIndex = 0;

        // stop all of the child forks
        for (const fork of this.forks) {
            fork.stop();
        }
    }

    public async executeBlock(block: BlockType<keyof T>) {
        for (const service of this.services) {
            if (typeof service.onBeforeBlock === "function") {
                service.onBeforeBlock({
                    block,
                    engine: this,
                });
            }
        }

        const blockFn = this.blockFunctions[block.type];

        if (!blockFn) {
            throw new Error(
                `Block type ${block.type as string} is not registered`
            );
        }

        const data = await blockFn(block.props, {
            engine: this,
            block: block,
        });

        for (const service of this.services) {
            if (typeof service.onAfterBlock === "function") {
                service.onAfterBlock({
                    block,
                    engine: this,
                });
            }
        }

        return data;
    }
}
