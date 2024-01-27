declare module "characterset" {
  // Composed from https://github.com/bramstein/characterset/blob/7ea0da225df3674b941e59977c951c1e9b5beb2b/README.md

  type CharRange = (number | [number, number])[];

  class CharacterSet {
    constructor();
    constructor(codePoint: number);
    constructor(characters: string);
    constructor(ranges: CharRange);

    getSize(): number;
    toArray(): number[];
    toRange(): CharRange;
    add(...codePoint: number);
    remove(...codePoint: number);
    contains(codePoint: number): boolean;
    equals(other: CharacterSet): boolean;
    union(other: CharacterSet): CharacterSet;
    intersect(other: CharacterSet): CharacterSet;
    difference(other: CharacterSet): CharacterSet;
    subset(other): boolean;
    toRegExp(): RegExp;
    toString(): string;
    toHexString(): string;
    toHexRangeString(): string;
  }
  export default CharacterSet;
}
