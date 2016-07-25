import * as Q from 'q';
export declare abstract class CommonMethods {
    machineName: string;
    constructor(machineName: string);
    protected isDebug: boolean;
    debug(debugging?: boolean): this;
    protected runWithoutDebugOnce<T>(promise: Q.Promise<T>): Q.Promise<T>;
}
