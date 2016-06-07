import * as Q from 'q';

export abstract class Debuggable {
    constructor(protected _debug: boolean) {
    }

    debug(debugging?: boolean) {
        this._debug = (debugging === undefined || debugging === true) ? true : false;
        return this;
    }

    protected runWithoutDebugOnce(promise: Q.Promise<any>) {
        return Q.Promise<string>((resolve, reject) => {
            let _d = this._debug;
            this._debug = false;
            promise.then(
                (val) => {
                    this._debug = _d;
                    resolve(val);
                },
                (err) => { 
                    this._debug = _d;
                    reject(err);
                }
            );
        });
    }
}