"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var path = require('path');
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.image', function () {
    var cmd;
    var machineName = 'docker-cmd-js-test';
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('build()', function (done) {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql') }).then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    }, 2 * 60 * 1000);
    it('build() and replace', function (done) {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql'), freshBuild: true }).then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    });
    it('resToJSON()', function (done) {
        cmd.run('docker images').then(function (res) {
            var images = cmd.resToJSON(res);
            expect(images.length).toBeGreaterThan(0);
            expect(images[0]['REPOSITORY']).toBeDefined();
            expect(images[0]['TAG']).toBeDefined();
            expect(images[0]['IMAGE ID']).toBeDefined();
            expect(images[0]['CREATED']).toBeDefined();
            expect(images[0]['SIZE']).toBeDefined();
            done();
        }, function (err) { done.fail(err); });
    });
    it('remove()', function (done) {
        cmd.image.remove('docker_cmd_js_mysql').then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    });
});
