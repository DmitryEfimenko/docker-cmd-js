export declare abstract class CommonMethods {
    machineName: string;
    constructor(machineName: string);
    protected isDebug: boolean;
    debug(debugging?: boolean): this;
    protected runWithoutDebugOnce<T>(promise: Promise<T>): Promise<T>;
}
