import * as Q from 'q';
export declare abstract class Debuggable {
    protected _debug: boolean;
    constructor(_debug: boolean);
    debug(debugging?: boolean): this;
    protected runWithoutDebugOnce(promise: Q.Promise<any>): Q.Promise<string>;
}
