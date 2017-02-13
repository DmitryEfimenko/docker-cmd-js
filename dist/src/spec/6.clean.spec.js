"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const docker_cmd_js_1 = require('../docker-cmd-js');
const const_1 = require('./helpers/const');
describe('cmd.machine', () => {
    let cmd;
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName);
    });
    xit('remove()', (done) => {
        cmd.machine.remove().then(() => {
            cmd.machine.status().then((status) => {
                expect(status).toBe(`Host does not exist: "${const_1.machineName}"`);
                done();
            }, (err) => { done.fail(err); });
        }, (err) => { done.fail(err); });
    }, 3 * 60 * 1000);
});
