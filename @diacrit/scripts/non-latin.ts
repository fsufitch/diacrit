// This script reads from stdin and prints a unique'd list of non-latin characters used in it

import readline from "node:readline/promises";

import { CharacterSets } from "@diacrit/common/unicode";
import { CodePoint } from "@diacrit/common/charset";

const readCodePoints = async function* (input: AsyncIterable<string>) {
  for await (let it of input) {
    it = it.toLowerCase();
    yield* CodePoint.streamOf(it);
  }
};

const filterNonLatin = async function* (codePoints: AsyncIterable<CodePoint>) {
  for await (const cp of codePoints) {
    if (!CharacterSets.LATIN.contains(cp)) {
      yield cp;
    }
  }
};

const main = async () => {
  const reader = readline.createInterface(process.stdin);
  const codePoints = readCodePoints(reader);
  const nonLatinCodePoints = filterNonLatin(codePoints);

  const uniqueCodePoints: Record<number, CodePoint> = {};
  for await (const cp of nonLatinCodePoints) {
    uniqueCodePoints[cp.valueOf()] = uniqueCodePoints[cp.valueOf()] || cp;
  }

  const output = Object.values(uniqueCodePoints).join("");
  console.log(output);
};

main();
