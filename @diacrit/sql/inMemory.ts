import { RxStatus } from "@diacrit/common/rxStatus";
import moment from "moment";
import { Database, SqlJsStatic } from "sql.js";
import SQL from "@diacrit/sql/runtime";
import { setSyntheticTrailingComments } from "typescript";
import { bindObject } from "@diacrit/common/sqlUtils";
import { normalize } from "../common/normalization";

export const T_WORDS = "words";
export const C_LANGUAGE = "lang";
export const C_WORD = "word";
export const C_NORMALIZED = "norm";

export type ConnectionState =
  | "disconnected"
  | "connected"
  | "pending"
  | "error";

export interface WordRow {
  language: string;
  word: string;
  normalized: string;
}

export class InMemorySQL {
  private dbInstance: Database;
  readonly status = new RxStatus<ConnectionState>({ state: "disconnected" });

  constructor(protected SQL: SqlJsStatic, data?: Buffer) {
    console.info("creating in-memory db");
    this.dbInstance = new this.SQL.Database(data);
    this.status.push({ state: "connected" });
  }

  get db(): Database {
    return this.dbInstance;
  }

  private readonly checkSchemaQuery = `
  SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%';
`;

  private readonly createSchemaQuery = `
  CREATE TABLE ${T_WORDS} (${C_LANGUAGE} TEXT, ${C_WORD} TEXT, ${C_NORMALIZED} TEXT);
`;

  initSchema() {
    this.status.push({
      state: "pending",
      pendingMessage: "initializing schema",
    });
    const results = this.db.exec(this.checkSchemaQuery);
    const tableNames = results.flatMap((r) => r.values).map((row) => row[0]);

    if (tableNames.includes(T_WORDS)) {
      console.debug("skipping schema init: already initialized");
    }
    console.info("initializing schema");
    this.db.run(this.createSchemaQuery);
    this.status.push({ state: "connected" });
  }

  private addWordQuery = `
        INSERT INTO ${T_WORDS} (${C_LANGUAGE}, ${C_WORD}, ${C_NORMALIZED}) VALUES (:language, :word, :normalized);
    `;

  insertWords(...words: WordRow[]) {
    this.status.push({
      state: "pending",
      pendingMessage: `inserting ${words.length} words`,
      pendingProgress: 0,
      pendingStart: moment(),
      errorMessage: "",
    });
    const stmt = this.db.prepare(this.addWordQuery, {});

    let count = 0;
    try {
      for (const word of words) {
        bindObject(stmt, word as any);
        stmt.run();
        count++;
        this.status.push({ pendingProgress: count / words.length });
      }
      this.status.push({ state: "connected" });
    } catch (reason) {
      this.status.push({
        state: "error",
        errorMessage: `query failed: ${reason}`,
      });
      throw `query failed: ${reason}`;
    } finally {
      stmt.free();
    }
  }

  private findAlternativesQuery = `
    SELECT ${C_WORD} FROM ${T_WORDS} WHERE ${C_LANGUAGE}=:language AND ${C_NORMALIZED}=:normalized
  `;

  findAlternatives(word: string, language: string): string[] {
    this.status.push({
      state: "pending",
      pendingMessage: "finding alternatives",
      pendingProgress: 0,
      pendingStart: moment(),
    });
    const stmt = this.db.prepare(this.findAlternativesQuery);
    bindObject(stmt, { language, normalized: normalize(word, language) });

    const alternatives = new Array<string>();
    while (stmt.step()) {
      const alt = stmt.getAsObject().word;
      if (!alt || typeof alt !== "string") {
        console.warn("received invalid word", alt);
        continue;
      }
      alternatives.push(alt);
    }

    stmt.free();
    this.status.push({
      state: 'connected'
    })
    return alternatives;
  }
}
