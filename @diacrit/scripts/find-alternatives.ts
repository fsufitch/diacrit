import { InMemorySQL } from "@diacrit/sql/inMemory";
import commander from "commander";
import { readFile } from "fs/promises";
import SQL from "@diacrit/sql/runtime";
import readline from "node:readline/promises";
import { LANGUAGES, normalize } from "@diacrit/common/normalization";

const printAlternarives = (db: InMemorySQL, word: string, language: string) => {
  const alts = db.findAlternatives(word, language);
  console.log(`${word} => ${alts.join(", ")}`);
};

const main = async (_language: string, _wordsDbPath: string) => {
  const language = `${_language}`;
  const wordsDbPath = `${_wordsDbPath}`;

  const wordsData = await readFile(wordsDbPath);
  const db = new InMemorySQL(await SQL(), wordsData);

  const stdinLines = readline.createInterface(
    process.stdin,
    process.stderr,
    undefined,
    true
  );
  if (stdinLines.terminal) {
    stdinLines.setPrompt("? ");
  }
  stdinLines.prompt();
  for await (const line of stdinLines) {
    const word = normalize(line.trim(), language);
    const alts = db.findAlternatives(word, language);
    if (alts.length) {
      console.log(`${word} => ${alts.join(", ")}`);
    } else {
      console.log(`INVALID WORD`);
    }
    stdinLines.prompt();
  }
  console.log();
};

commander.program
  .addArgument(
    new commander.Argument("language", "language for normalization").choices(
      LANGUAGES
    )
  )
  .addArgument(new commander.Argument("words-db", "words database file"))
  .action(main)
  .parseAsync();
