export abstract class CommonMethods {
  constructor(public machineName: string) { }

  protected isDebug: boolean;

  public debug(debugging?: boolean) {
    this.isDebug = (debugging === undefined || debugging === true) ? true : false;
    return this;
  }

  protected async runWithoutDebugOnce<T>(promise: Promise<T>) {
    let _d = this.isDebug;
    try {
      this.isDebug = false;
      let val = await promise;
      this.isDebug = _d;
      return val;
    } catch (ex) {
      this.isDebug = _d;
      throw ex;
    }
  }
}
