delete require.cache[require.resolve('../src/docker-cmd-js')];
import * as path from 'path';
var tcpPortUsed = require('tcp-port-used');

import { Cmd } from '../src/docker-cmd-js';

describe('cmd.container', () => {
    let cmd: Cmd;
    let machineName = 'docker-cmd-js-test';

    beforeAll((done) => {
        cmd = new Cmd(machineName);
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql'), buildOnlyIfMissing: true }).then(
            () => { done(); },
            (err) => { done.fail(err); }
        );
    }, 1 * 20 * 1000);

    afterAll((done) => {
        cmd.run(`docker rm -f docker_cmd_js_mysql`)
            .then(() => cmd.image.remove('docker_cmd_js_mysql'))
            .catch((err) => { done.fail(err); })
            .then(() => { done(); });
    });
    
    it('start()', (done) => {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(
            (wasStarted) => {
                expect(wasStarted).toBeFalsy();
                cmd.run('docker ps').then(
                    (res) => {
                        let containers = cmd.resToJSON(res);
                        expect(containers.length).toBeGreaterThan(0);
                        expect(containers[0]['NAMES']).toBe('docker_cmd_js_mysql');
                        done();
                    }
                );
            },
            (err) => {
                done.fail(err);
            }
        );
    });

    it('status()', (done) => {
        cmd.container.status('docker_cmd_js_mysql').then(
            (status) => {
                expect(status.indexOf('Up') === 0).toBeTruthy();
                done();
            },
            (err) => { done.fail(err); }
        );
    });

    it('start() on running container', (done) => {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(
            (wasStarted) => {
                expect(wasStarted).toBeTruthy();
                done();
            },
            (err) => {
                done.fail(err);
            }
        );
    });

    it('waitForPort()', (done) => {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(
            () => {
                cmd.machine.ipAddress().then(
                    (ip) => {
                        tcpPortUsed.check(3306, ip).then(
                            (inUse) => {
                                if (!inUse) {
                                    cmd.container.waitForPort({ port: 3306, timeoutMs: 30 * 60 * 1000 }).then(
                                        () => {
                                            tcpPortUsed.check(3306, ip).then(
                                                (inUse) => {
                                                    expect(inUse).toBe(true);
                                                    done();
                                                },
                                                (err) => { done.fail(err); }
                                            );
                                        
                                        },
                                        (err) => { done.fail(err); }
                                    );
                                } else {
                                    done.fail('port is unexpectedly awailable too fast. Was container already started?');
                                }    
                            },
                            (err) => { done.fail(err); }
                        );
                    },
                    (err) => { done.fail(err); }
                );
            },
            (err) => {
                done.fail(err);
            }
        );
    }, 30 * 60 * 1000);
});