import {CharacterSet} from '@diacrit/common/charset';


let LATIN: CharacterSet | null = null;
const buildLatin = (): CharacterSet => {
  return new CharacterSet([
    [0x0001, 0x007f], // https://en.wikipedia.org/wiki/Basic_Latin_(Unicode_block)
  ]);
};


export const CharacterSets = {
  get LATIN(): CharacterSet {
    return (LATIN = LATIN ?? buildLatin());
  },
};
