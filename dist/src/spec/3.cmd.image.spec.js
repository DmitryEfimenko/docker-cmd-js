"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
delete require.cache[require.resolve('../docker-cmd-js')];
const path = require("path");
const docker_cmd_js_1 = require("../docker-cmd-js");
const const_1 = require("./helpers/const");
describe('cmd.image', () => {
    let cmd;
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName);
    });
    it('build()', (done) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield cmd.image.debug(true).build('docker_cmd_js_mysql', {
                file: path.join(__dirname, 'mysql', 'Dockerfile')
            });
            done();
        }
        catch (ex) {
            done.fail(ex);
        }
    }), 2 * 60 * 1000);
    it('build() and replace', (done) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield cmd.image.build('docker_cmd_js_mysql', {
                file: path.join(__dirname, 'mysql', 'Dockerfile')
            });
            done();
        }
        catch (ex) {
            done.fail(ex);
        }
    }));
    it('resToJSON()', (done) => {
        cmd.run('docker images').then((res) => {
            const images = cmd.resToJSON(res);
            expect(images.length).toBeGreaterThan(0);
            expect(images[0]['REPOSITORY']).toBeDefined();
            expect(images[0]['TAG']).toBeDefined();
            expect(images[0]['IMAGE ID']).toBeDefined();
            expect(images[0]['CREATED']).toBeDefined();
            expect(images[0]['SIZE']).toBeDefined();
            done();
        }, (err) => { done.fail(err); });
    });
    it('remove()', (done) => {
        cmd.image.remove('docker_cmd_js_mysql').then(() => {
            done();
        }, (err) => {
            done.fail(err);
        });
    });
});
