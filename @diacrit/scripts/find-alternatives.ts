import { InMemorySQL } from "@diacrit/sql/inMemory";
import commander from "commander";
import { readFile } from "fs/promises";
import SQL from "@diacrit/sql/runtime";
import readline from "node:readline/promises";
import { LANGUAGES, normalize } from "@diacrit/common/normalization";

const main = async (_language: string, _wordsDbPath: string) => {
  const language = `${_language}`;
  const wordsDbPath = `${_wordsDbPath}`;

  const wordsData = await readFile(wordsDbPath);
  const db = new InMemorySQL(await SQL(), wordsData);

  const interactive = !!process.stdin.isTTY;
  const stdinLines = readline.createInterface(
    process.stdin,
    interactive ? process.stderr : undefined
  );
  stdinLines.setPrompt(interactive ? "? " : "");

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
