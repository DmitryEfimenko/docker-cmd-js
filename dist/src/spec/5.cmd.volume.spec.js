"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const docker_cmd_js_1 = require('../docker-cmd-js');
describe('cmd.volume', () => {
    let cmd;
    let machineName = 'docker-cmd-js-test';
    let testVolName = 'testVol';
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('create()', (done) => {
        cmd.volume.create({ name: testVolName }).then(() => {
            cmd.volume.inspect(testVolName).then((res) => {
                expect(res.length).toBe(1);
                expect(res[0].Name).toBe(testVolName);
                done();
            }, (err) => { done.fail(err); });
        }, (err) => {
            done.fail(err);
        });
    });
    it('create() only if missing', (done) => {
        cmd.volume.create({ name: testVolName }, { createOnlyIfMissing: true }).then(() => {
            cmd.volume.inspect(testVolName).then((res) => {
                expect(res.length).toBe(1);
                done();
            }, (err) => { done.fail(err); });
        }, (err) => {
            done.fail(err);
        });
    });
    it('remove()', (done) => {
        cmd.volume.remove(testVolName).then(() => {
            cmd.volume.inspect(testVolName).then((res) => {
                expect(res.length).toBe(0);
                done();
            }, (err) => { done.fail(err); });
        }, (err) => { done.fail(err); });
    });
});
