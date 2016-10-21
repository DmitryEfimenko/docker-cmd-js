"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const docker_cmd_js_1 = require('../docker-cmd-js');
describe('cmd.machine', () => {
    let cmd;
    let machineName = 'docker-cmd-js-test';
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('remove()', (done) => {
        cmd.machine.remove().then(() => {
            cmd.machine.status().then((status) => {
                expect(status).toBe(`Host does not exist: "${machineName}"`);
                done();
            }, (err) => { done.fail(err); });
        }, (err) => { done.fail(err); });
    }, 3 * 60 * 1000);
});
