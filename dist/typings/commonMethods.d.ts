import * as Q from 'q';
export declare abstract class CommonMethods {
    protected runWithoutDebugOnce<T>(promise: Q.Promise<T>): Q.Promise<T>;
}
