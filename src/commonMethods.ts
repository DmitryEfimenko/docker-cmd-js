import * as Q from 'q';
import { Opts } from './base';

export abstract class CommonMethods {
    protected runWithoutDebugOnce<T>(promise: Q.Promise<T>) {
        return Q.Promise<T>((resolve, reject) => {
            let _d = Opts.debug;
            Opts.debug = false;
            promise.then(
                (val) => {
                    Opts.debug = _d;
                    resolve(val);
                },
                (err) => {
                    Opts.debug = _d;
                    reject(err);
                }
            );
        });
    }
}
