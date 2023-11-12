export const PI: number = Math.PI;
export const PIQuart: number = Math.PI / 4;
export const PIHalf: number = Math.PI / 2;
export const PIAndAHalf: number = Math.PI / 2 + Math.PI;
export const PIDouble: number = Math.PI * 2;
export const OneDegInRad: number = PIDouble / 360;

// Rainbow logging
export const nyanConsole = (message: string) => {
    console.log(
        '%c ' + message,
        'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113); margin-bottom: 12px; padding: 25px'
    );
};

export const clamp = (value: number, upper: number, lower: number) =>
    value > upper ? upper : value < lower ? lower : value;

export const array2D = <T>(rows: number, cols: number, generator: (row: number, col: number) => T): T[][] =>
    Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (__, col) => generator(row, col)));
