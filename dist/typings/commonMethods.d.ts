export declare abstract class CommonMethods {
    machineName: string;
    protected isDebug: boolean;
    constructor(machineName: string);
    debug(debugging?: boolean): this;
    protected runWithoutDebugOnce<T>(promise: Promise<T>): Promise<T>;
}
