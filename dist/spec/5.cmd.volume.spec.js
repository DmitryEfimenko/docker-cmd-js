"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.volume', function () {
    var cmd;
    var machineName = 'docker-cmd-js-test';
    var testVolName = 'testVol';
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('create()', function (done) {
        cmd.volume.create({ name: testVolName }).then(function () {
            cmd.volume.inspect(testVolName).then(function (res) {
                expect(res.length).toBe(1);
                expect(res[0].Name).toBe(testVolName);
                done();
            }, function (err) { done.fail(err); });
        }, function (err) {
            done.fail(err);
        });
    });
    it('create() only if missing', function (done) {
        cmd.volume.create({ name: testVolName }, { createOnlyIfMissing: true }).then(function () {
            cmd.volume.inspect(testVolName).then(function (res) {
                expect(res.length).toBe(1);
                done();
            }, function (err) { done.fail(err); });
        }, function (err) {
            done.fail(err);
        });
    });
    it('remove()', function (done) {
        cmd.volume.remove(testVolName).then(function () {
            cmd.volume.inspect(testVolName).then(function (res) {
                expect(res.length).toBe(0);
                done();
            }, function (err) { done.fail(err); });
        }, function (err) { done.fail(err); });
    });
});
