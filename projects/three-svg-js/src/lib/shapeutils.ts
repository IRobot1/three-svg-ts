import { Matrix4, Mesh, Vector3 } from "three";

export type PathCommandType = 'M' | 'H' | 'V' | 'L' | 'C' | 'S' | 'Q' | 'T' | 'm' | 'h' | 'v' | 'l' | 'c' | 's' | 'q' | 't' | 'A' | 'a' | 'Z' | 'z'

export interface PathCommand {
  type: PathCommandType
  values: Array<number>
}

export class SVGShapeUtils {
  static parseFloatWithUnits(length: string | number | undefined | null, size = 0): number | undefined {
    if (!length) return undefined;

    let value = length.toString();
    if (typeof length === "string") {
      if (length.endsWith("%")) {
        return size * parseFloat(length) / 100
      } else {
        return parseFloat(value)
      }
    }
    else return <number>length
  }

  static parsePath(d: string): Array<PathCommand> {
    const pathcommands: Array<PathCommand> = []
    if (d === '' || d === 'none') return pathcommands;

    const commands = d.match(/[a-df-z][^a-df-z]*/ig);
    if (!commands) return pathcommands

    for (let i = 0, l = commands.length; i < l; i++) {

      const command = commands[i];

      const type = command.charAt(0) as PathCommandType
      const data = command.slice(1).trim();

      let numbers;
      let addcommand = true

      switch (type) {

        case 'M':
        case 'H':
        case 'V':
        case 'L':
        case 'C':
        case 'S':
        case 'Q':
        case 'T':
        case 'm':
        case 'h':
        case 'v':
        case 'l':
        case 'c':
        case 's':
        case 'q':
        case 't':
          numbers = this.parseFloats(data);
          break;
        case 'A':
        case 'a':
          numbers = this.parseFloats(data, [3, 4], 7);
          break
        case 'Z':
        case 'z':
          break;
        default:
          console.warn(command);
          addcommand = false
          break

      }

      if (addcommand) {
        if (!numbers) numbers = []
        pathcommands.push({ type, values: numbers })
      }
    }

    return pathcommands
  }


  static parseFloats(input: string, flags?: any, stride?: any) {

    // Character groups
    const RE = {
      SEPARATOR: /[ \t\r\n\,.\-+]/,
      WHITESPACE: /[ \t\r\n]/,
      DIGIT: /[\d]/,
      SIGN: /[-+]/,
      POINT: /\./,
      COMMA: /,/,
      EXP: /e/i,
      FLAGS: /[01]/
    };

    // States
    const SEP = 0;
    const INT = 1;
    const FLOAT = 2;
    const EXP = 3;

    let state = SEP;
    let seenComma = true;
    let number = '', exponent = '';
    const result: Array<any> = [];

    function throwSyntaxError(current: string, i: number, partial: any) {

      const error = new SyntaxError('Unexpected character "' + current + '" at index ' + i + '.');
      //error.partial = partial;
      throw error;

    }

    function newNumber() {

      if (number !== '') {

        if (exponent === '') result.push(Number(number));
        else result.push(Number(number) * Math.pow(10, Number(exponent)));

      }

      number = '';
      exponent = '';

    }

    let current;
    const length = input.length;

    for (let i = 0; i < length; i++) {

      current = input[i];

      // check for flags
      if (Array.isArray(flags) && flags.includes(result.length % stride) && RE.FLAGS.test(current)) {

        state = INT;
        number = current;
        newNumber();
        continue;

      }

      // parse until next number
      if (state === SEP) {

        // eat whitespace
        if (RE.WHITESPACE.test(current)) {

          continue;

        }

        // start new number
        if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {

          state = INT;
          number = current;
          continue;

        }

        if (RE.POINT.test(current)) {

          state = FLOAT;
          number = current;
          continue;

        }

        // throw on double commas (e.g. "1, , 2")
        if (RE.COMMA.test(current)) {

          if (seenComma) {

            throwSyntaxError(current, i, result);

          }

          seenComma = true;

        }

      }

      // parse integer part
      if (state === INT) {

        if (RE.DIGIT.test(current)) {

          number += current;
          continue;

        }

        if (RE.POINT.test(current)) {

          number += current;
          state = FLOAT;
          continue;

        }

        if (RE.EXP.test(current)) {

          state = EXP;
          continue;

        }

        // throw on double signs ("-+1"), but not on sign as separator ("-1-2")
        if (RE.SIGN.test(current)
          && number.length === 1
          && RE.SIGN.test(number[0])) {

          throwSyntaxError(current, i, result);

        }

      }

      // parse decimal part
      if (state === FLOAT) {

        if (RE.DIGIT.test(current)) {

          number += current;
          continue;

        }

        if (RE.EXP.test(current)) {

          state = EXP;
          continue;

        }

        // throw on double decimal points (e.g. "1..2")
        if (RE.POINT.test(current) && number[number.length - 1] === '.') {

          throwSyntaxError(current, i, result);

        }

      }

      // parse exponent part
      if (state === EXP) {

        if (RE.DIGIT.test(current)) {

          exponent += current;
          continue;

        }

        if (RE.SIGN.test(current)) {

          if (exponent === '') {

            exponent += current;
            continue;

          }

          if (exponent.length === 1 && RE.SIGN.test(exponent)) {

            throwSyntaxError(current, i, result);

          }

        }

      }


      // end of number
      if (RE.WHITESPACE.test(current)) {

        newNumber();
        state = SEP;
        seenComma = false;

      } else if (RE.COMMA.test(current)) {

        newNumber();
        state = SEP;
        seenComma = true;

      } else if (RE.SIGN.test(current)) {

        newNumber();
        state = INT;
        number = current;

      } else if (RE.POINT.test(current)) {

        newNumber();
        state = FLOAT;
        number = current;

      } else {

        throwSyntaxError(current, i, result);

      }

    }

    // add the last number found (if any)
    newNumber();

    return result;

  }

  static processTransform(object: Mesh, transformText: string) {
    const transformsTexts = transformText.split(')');

    transformsTexts.forEach(transformText => {
      transformText = transformText.trim()

      if (transformText === '') return

      const openParPos = transformText.indexOf('(');
      const closeParPos = transformText.length;

      if (openParPos > 0 && openParPos < closeParPos) {

        const transformType = transformText.slice(0, openParPos);

        const array = this.parseFloats(transformText.slice(openParPos + 1));

        //console.warn(transformType)

        switch (transformType) {

          case 'translate':

            if (array.length >= 1) {

              const tx = array[0];
              object.translateX(tx * object.scale.x)

              let ty = 0;
              if (array.length >= 2) {
                ty = array[1];
              }
              object.translateY(ty * object.scale.y)
            }

            break;

          case 'rotate':
            if (array.length >= 1) {

              let angle = 0;
              let cx = 0;
              let cy = 0;

              // Angle
              angle = array[0] * Math.PI / 180;

              if (array.length >= 3) {

                // Center x, y
                cx = array[1];
                cy = array[2];

              }

              // Rotate around center (cx, cy)
              object.rotateOnAxis(new Vector3(cx, cy, 1).normalize(), angle)
            }

            break;

          case 'scale':

            if (array.length >= 1) {

              const scaleX = array[0];
              let scaleY = scaleX;

              if (array.length >= 2) {

                scaleY = array[1];

              }

              object.scale.set(scaleX, scaleY, 1)

            }

            break;

          case 'skewX':

            if (array.length === 1) {
              const matrix = new Matrix4();
              const amount = array[0] * Math.PI / 180
              matrix.makeShear(amount, 0, 0, 0, 0, 0);
              object.geometry.applyMatrix4(matrix);
            }

            break;

          case 'skewY':

            if (array.length === 1) {
              const matrix = new Matrix4();
              const amount = array[0] * Math.PI / 180
              matrix.makeShear(0, 0, amount, 0, 0, 0);
              object.geometry.applyMatrix4(matrix);
            }

            break;

          case 'matrix':

            if (array.length === 6) {

              const matrix = new Matrix4();

              matrix.set(
                array[0], array[2], 0, array[4],
                array[1], array[3], 0, array[5],
                0, 0, 1, 0,
                0, 0, 0, 1
              );

              object.applyMatrix4(matrix)
            }

            break;
          default:
            console.warn(`Transform ${transformType} not implemented`)
            break;
        }

      }

    })
  }

}
