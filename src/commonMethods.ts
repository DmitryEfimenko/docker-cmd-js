export abstract class CommonMethods {
  protected isDebug: boolean;

  constructor(public machineName: string) { }

  public debug(debugging?: boolean) {
    this.isDebug = (debugging === undefined || debugging === true) ? true : false;
    return this;
  }

  protected async runWithoutDebugOnce<T>(promise: Promise<T>) {
    const _d = this.isDebug;
    try {
      this.isDebug = false;
      const val = await promise;
      this.isDebug = _d;
      return val;
    } catch (ex) {
      this.isDebug = _d;
      throw ex;
    }
  }
}
