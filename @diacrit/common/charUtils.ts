
export const asCodePointNumber = (ch: string): number => {
  if (ch.codePointAt(1) !== undefined) {
    throw `cannot convert string to code point (string too long: ${ch.length})`;
  }
  const num = ch.codePointAt(0);
  if (num === undefined) {
    throw `undefined codepoint`;
  }
  return num;
};
