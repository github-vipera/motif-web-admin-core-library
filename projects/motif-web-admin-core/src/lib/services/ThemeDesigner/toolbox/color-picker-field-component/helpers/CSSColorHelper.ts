import * as __color_parse from 'color-parse';
const color_parse = __color_parse;
import { Color } from 'ngx-color';


export class CSSColorHelper {

  public static toCSSString(color: Color):string {
    return CSSColorHelper.toCSSValue(color);
  }

  public static fromCSSString(value:string){
    return color_parse(value);
  }

  public static invertColor(color: Color): string {
    if (color){
      return CSSColorHelper.invertColorHex(color.hex, true);
    } else {
      return "#ddd";
    }
  }

  private static invertColorHex(hex, bw) {
    if (hex && hex.length > 7){
      hex = hex.substring(0, 7);
    }
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    let r1 = (255 - r).toString(16);
    let g1 = (255 - g).toString(16);
    let b1 = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + this.padZero(r1) + this.padZero(g1) + this.padZero(b1);
  }

  private  static padZero(str:string, len?:number):string {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
  }

  private static toCSSValue(color: Color):string {
    if (color){
      if (color.rgb.a===1){
        return this.toHexValue(color);
      } else {
        return this.toRGBAValue(color);
      }
    } else {
      return "";
    }
  }

  private static toHexValue(color: Color):string {
    return color.hex;
  }

  private static toRGBAValue(color: Color):string {
    return "rgba("+ color.rgb.r + "," + color.rgb.g +"," + color.rgb.b +", " + color.rgb.a +")";
  }


}
