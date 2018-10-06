
export class BasicConfig {

  private _name: string;
  private _toolbar_color: string;
  private _image: string;

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

  public fromJSON(json) {
    for (let propName in json)
      this["_" + propName] = json[propName];
    return this;
  }
}
