import * as Q from 'q';

export abstract class CommonMethods {
    constructor(public machineName: string) { }

    protected isDebug: boolean;

    public debug(debugging?: boolean) {
        this.isDebug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    }

    protected runWithoutDebugOnce<T>(promise: Q.Promise<T>) {
        return Q.Promise<T>((resolve, reject) => {
            let _d = this.isDebug;
            this.isDebug = false;
            promise.then(
                (val) => {
                    this.isDebug = _d;
                    resolve(val);
                },
                (err) => {
                    this.isDebug = _d;
                    reject(err);
                }
            );
        });
    }
}
