
export class BasicConfig {

  private _name: string;
  private _toolbar_color: string;
  private _image: string;
  private _mode: string;

  constructor() {
    // nothing to do here
  }

  get name(): string {
    return this._name;
  }

  get toolbar_color(): string {
    return this._toolbar_color;
  }

  get image(): string {
    return this._image;
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
