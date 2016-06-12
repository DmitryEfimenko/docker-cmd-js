import * as Q from 'q';
import { Opts } from './docker-cmd-js';

export abstract class CommonMethods {
    protected static runWithoutDebugOnce(promise: Q.Promise<any>) {
        return Q.Promise<string>((resolve, reject) => {
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