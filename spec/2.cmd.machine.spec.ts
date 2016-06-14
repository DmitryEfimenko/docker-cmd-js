delete require.cache[require.resolve('../src/docker-cmd-js')];

import { Cmd } from '../src/docker-cmd-js';

describe('cmd.machine', () => {
    let cmd: Cmd;
    let machineName = 'docker-cmd-js-test';

    beforeAll(() => {
        cmd = new Cmd(machineName);
    });
    
    it('status()', (done) => {
        cmd.machine.status().then(
            (status) => {
                expect(status).toBe('Running');
                done();
            },
            (err) => {
                done.fail(err);
            }
        );
    });

    it('ipAddress()', (done) => {
        cmd.machine.ipAddress().then(
            (ipAddress) => {
                expect(ipAddress).toBeDefined();
                expect(cmd.machine._ipAddress).toBe(ipAddress);
                done();
            },
            (err) => {
                done.fail(err);
            }
        );
    });
});