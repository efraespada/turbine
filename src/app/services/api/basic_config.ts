
export class BasicConfig {

  private _name: string;
  private _toolbar_color: string;

  constructor() {
    // nothing to do here
  }

  get name(): string {
    return this._name;
  }

  get toolbar_color(): string {
    return this._toolbar_color;
  }

  public fromJSON(json) {
    for (let propName in json)
      this["_" + propName] = json[propName];
    return this;
  }
}
