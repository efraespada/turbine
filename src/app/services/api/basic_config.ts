
export class BasicConfig {

  private _mode: string;

  constructor() {
    // nothing to do here
  }

  get mode(): string {
    return this._mode;
  }

  public fromJSON(json) {
    for (let propName in json)
      this["_" + propName] = json[propName];
    return this;
  }
}
