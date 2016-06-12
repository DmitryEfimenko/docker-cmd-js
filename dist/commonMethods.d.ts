import * as Q from 'q';
export declare abstract class CommonMethods {
    protected static runWithoutDebugOnce(promise: Q.Promise<any>): Q.Promise<string>;
}
