"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const docker_cmd_js_1 = require('../docker-cmd-js');
describe('cmd.machine', () => {
    let cmd;
    let machineName = 'docker-cmd-js-test';
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('status()', (done) => {
        cmd.machine.status().then((status) => {
            expect(status).toBe('Running');
            done();
        }, (err) => {
            done.fail(err);
        });
    });
    it('ipAddress()', (done) => {
        cmd.machine.ipAddress().then((ipAddress) => {
            expect(ipAddress).toBeDefined();
            expect(cmd.machine._ipAddress).toBe(ipAddress);
            done();
        }, (err) => {
            done.fail(err);
        });
    });
});
