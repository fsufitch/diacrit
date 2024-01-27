#!env ts-node
// This script reads from stdin and prints a unique'd list of non-latin characters used in it

import _CharacterSet from "characterset";

import { isAsyncIterable, isIterable } from "./asyncUtils";

type CodePointable = string | number | Number;

export const isSingleCodePoint = (input: string) => {
  const cp = input.codePointAt(0);
  return cp !== undefined && String.fromCodePoint(cp) === input;
};

export class CodePoint extends Number {
  constructor(input: CodePointable) {
    switch (true) {
      case input instanceof Number:
        super(input.valueOf());
        break;
      case typeof input === "number":
        super(input);
        break;
      case typeof input === "string":
        if (!isSingleCodePoint(input)) {
          throw `not a single code point: ${input}`
        }
        super(input.codePointAt(0));
        break;
      default:
        console.error("invalid CodePoint init value", input);
        throw `invalid CodePoint init value: ${input}`;
    }
  }

  override toString() {
    return String.fromCodePoint(this.valueOf());
  }

  override toLocaleString(): string {
    return this.toString();
  }

  static *streamOf(input: string) {
    let offset = 0;
    while (true) {
      let cp = input.codePointAt(offset);
      if (cp === undefined) {
        break;
      }
      yield new CodePoint(cp);
      offset += String.fromCodePoint(cp).length;
    }
  }

  static isOneCodePoint(input: string): boolean {
    const cp = input.codePointAt(0);
    return cp !== undefined && String.fromCodePoint(cp) === input;
  }
}

export class CharacterSet extends _CharacterSet {
  override contains(codePoint: CodePointable): boolean {
    if (typeof codePoint === "number") {
      return super.contains(codePoint);
    }
    return super.contains(new CodePoint(codePoint).valueOf());
  }

  filter<T extends CodePointable>(stream: Iterable<T>): Iterable<T>;
  filter<T extends CodePointable>(stream: AsyncIterable<T>): AsyncIterable<T>;
  filter<T extends CodePointable>(
    stream: Iterable<T> | AsyncIterable<T>
  ): unknown {
    switch (true) {
      case isIterable(stream):
        return this.filterSync(stream as Iterable<T>);
      case isAsyncIterable(stream):
        return this.filterAsync(stream as AsyncIterable<T>);
    }
    throw `input stream was not iterable or async iterable`;
  }

  private async *filterAsync<T extends CodePointable>(
    stream: AsyncIterable<T>
  ): AsyncIterable<T> {
    for await (const it of stream) {
      if (this.contains(it)) {
        yield it;
      }
    }
  }

  private *filterSync<T extends CodePointable>(
    stream: Iterable<T>
  ): Iterable<T> {
    for (const it of stream) {
      if (this.contains(it)) {
        yield it;
      }
    }
  }
}
