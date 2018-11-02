// https://stackoverflow.com/a/53052557
export class Util {
  static existValueInEnum(type: any, value: any): boolean {
    return Object.keys(type).filter(k => isNaN(Number(k))).filter(k => type[k] === value).length > 0;
  }
  static getFromValue(type: any, value: any): any {
    let keys = Object.keys(type);
    for (let k in keys) {
      console.log("keys: " + JSON.stringify(k));
    }
    //console.log("keys: " + keys);
    return "splash"
  }

}
