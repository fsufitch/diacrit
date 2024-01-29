import yaml from "js-yaml";

const NORMALIZATION_DATA = `
es:
  á: a
  é: e
  í: i
  ó: o
  ú: u
  ü: u
  ñ: n
  ¿:
  ¡:

fr:
  æ: ae
  œ: oe
  à: a
  â: a
  é: e
  è: e
  ê: e
  ë: e
  î: i
  ï: i
  ô: o
  û: u
  ü: u
  ç: c

ro:
  â: a
  é: e
  î: o
  ó: o
  ö: o
  ü: u
  ă: a
  š: s
  ș: s
  ț: t
`;

export const LANGUAGE_NORMALIZATIONS: {
  [lang: string]: { [original: string]: string };
} = yaml.load(NORMALIZATION_DATA) as any;

export const LANGUAGES = Object.keys(LANGUAGE_NORMALIZATIONS);

export const normalize = (word: string, language: string): string => {
    const normMap = LANGUAGE_NORMALIZATIONS[language];
    if (!normMap) {
        throw `unrecognized language: ${language}`
    }   
    let output = word.toLowerCase();
    for (const original in normMap) {
      const searchExp = new RegExp(original, 'g');
      output = output.replace(searchExp, normMap[original])
    }
    return output;
}