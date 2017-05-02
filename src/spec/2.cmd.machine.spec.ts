delete require.cache[require.resolve('../docker-cmd-js')];

import { Cmd } from '../docker-cmd-js';
import { machineName } from './helpers/const';

describe('cmd.machine', () => {
  let cmd: Cmd;

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

  it('ipAddress()', async (done) => {
    try {
      const ipAddress = await cmd.machine.ipAddress();
      expect(ipAddress).toBeDefined();
      expect(cmd.machine._ipAddress).toBe(ipAddress);
      done();
    } catch (ex) {
      done.fail(ex);
    }
  });
});
