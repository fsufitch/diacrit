import { LANGUAGES, normalize } from "@diacrit/common/normalization";
import { InMemorySQL } from "@diacrit/sql/inMemory";
import SQL from "@diacrit/sql/runtime";

import commander, { Argument } from "commander";
import { constants as fsConstants, access,readFile, open } from "fs/promises";
import { Readline } from "node:readline/promises";
import path from "path";
import { openStdin } from "process";
import readline from 'node:readline/promises';

const realMain = async (
  _language: unknown,
  _wordListPath: unknown,
  _outputPath: unknown
) => {
    const [language, wordListPath, outputPath] = [_language, _wordListPath, _outputPath] as string[];

    const db = new InMemorySQL(await SQL())
    db.initSchema()

    const fp = await open(wordListPath, fsConstants.O_RDONLY)
    const reader = readline.createInterface(fp.createReadStream())
    for await (const line of reader) {
        const word = line.trim();
        if (word.startsWith("#")) {
          // Comment line, ignore it
          continue
        }
        const normalized = normalize(word, language);
        db.insertWords({language, word, normalized});
    }
    await fp.close()
    
    const fpOut = await open(outputPath, fsConstants.O_TRUNC | fsConstants.O_WRONLY | fsConstants.O_CREAT)
    await fpOut.write(db.db.export())
    await fpOut.close();
};

const languageArgument = new Argument(
  "language",
  "language to use in normalization"
).choices(LANGUAGES);
const wordsFileArgument = new Argument(
  "words-file",
  "file containing the input words"
);
const outputPathArgument = new Argument(
  "output-file",
  "path to write the sqlite db to"
);

commander.program
  .addArgument(languageArgument)
  .addArgument(wordsFileArgument)
  .addArgument(outputPathArgument)
  .action(realMain)
  .parseAsync();
