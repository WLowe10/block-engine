export class StackFrame<T = any, K = any> {
    private parent: StackFrame<T, K> | null = null;
    private data: any = {};

    constructor(parent: StackFrame | null = null) {
        this.parent = parent;
    }

    public getData() {
        return this.data;
    }

    public getParent() {
        return this.parent;
    }

    public setParent(parentFrame: StackFrame<T, K>) {
        this.parent = parentFrame;
    }

    //may have incorrect logic
    public getStackData(): object {
        return Object.assign(this.data, this.parent?.getStackData())
    }

    //if the value exists in a a parent frame, it will also exist in the child frame
    public get(key: T): K | undefined {
        const value = this.data[key];

        if (typeof value !== "undefined") {
            return value;
        }

        return this.parent !== null ? this.parent.get(key) : undefined;
    }

    //if defined in a parent frame somewhere, it should change the value there
    public set(key: T, value: K): StackFrame<T, K> {
        let frame: StackFrame<T, K> | null = this;

        while (frame !== null) {
            const data = frame.getData();

            if (typeof data[key] !== "undefined") {
                data[key] = value

                return this;
            }

            frame = frame.parent
        }

        this.data[key] = value;

        return this;
    }

    public has(key: T): boolean {
        if (typeof this.data[key] !== "undefined") {
            return true;
        }

        return this.parent !== null ? this.parent.has(key) : false;
    }
}