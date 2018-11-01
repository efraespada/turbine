// https://stackoverflow.com/a/53052557
export class Util {
  static existValueInEnum(type: any, value: any): boolean {
    return Object.keys(type).filter(k => isNaN(Number(k))).filter(k => type[k] === value).length > 0;
  }
}
