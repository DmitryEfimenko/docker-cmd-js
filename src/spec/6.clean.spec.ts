delete require.cache[require.resolve('../docker-cmd-js')];
import { Cmd } from '../docker-cmd-js';
import { machineName } from './helpers/const';

describe('cmd.machine', () => {
  let cmd: Cmd;

  beforeAll(() => {
    cmd = new Cmd(machineName);
  });

  it('remove()', (done) => {
    cmd.machine.remove().then(
      () => {
        cmd.machine.status().then(
          (status) => {
            expect(status).toBe(`Host does not exist: "${machineName}"`);
            done();
          },
          (err) => { done.fail(err); }
        );
      },
      (err) => { done.fail(err); }
    );
  }, 3 * 60 * 1000); // 3 minutes
});
