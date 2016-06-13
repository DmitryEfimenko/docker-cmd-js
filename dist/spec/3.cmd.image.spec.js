"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var path = require('path');
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.image', function () {
    var cmd;
    beforeAll(function () {
        cmd = new docker_cmd_js_1.Cmd();
    });
    it('build()', function (done) {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql') }).then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    });
    it('build() and replace', function (done) {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql'), buildAndReplace: true }).then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    });
    it('remove()', function (done) {
        cmd.image.remove('docker_cmd_js_mysql').then(function () {
            done();
        }, function (err) {
            done.fail(err);
        });
    });
});
