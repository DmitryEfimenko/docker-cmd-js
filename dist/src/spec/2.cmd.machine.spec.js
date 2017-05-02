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
const docker_cmd_js_1 = require("../docker-cmd-js");
const const_1 = require("./helpers/const");
describe('cmd.machine', () => {
    let cmd;
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName);
    });
    it('status()', (done) => {
        cmd.machine.status().then((status) => {
            expect(status).toBe('Running');
            done();
        }, (err) => {
            done.fail(err);
        });
    });
    it('ipAddress()', (done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const ipAddress = yield cmd.machine.ipAddress();
            expect(ipAddress).toBeDefined();
            expect(cmd.machine._ipAddress).toBe(ipAddress);
            done();
        }
        catch (ex) {
            done.fail(ex);
        }
    }));
});
