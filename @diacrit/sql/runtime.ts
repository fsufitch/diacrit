import initSqlJs, { SqlJsStatic } from "sql.js";

export type RuntimeMode = "node" | "web";

export const detectRuntimeMode = () =>  Object.keys(global).includes('window') ? 'web' : 'node';

const initNodeMode = async function (): Promise<initSqlJs.SqlJsStatic> {
  try {
    await Promise.resolve();
    console.info("initializing sql.js in Node mode");
    const sql = await initSqlJs();
    console.info("successfully initalized sql.js in Node mode");
    return sql;
  } catch (reason) {
    console.info("failed initializing sql.js in Node mode; reason:", reason);
    throw "failed initializing sql.js in Node mode";
  }
};

const initWebMode = (): Promise<initSqlJs.SqlJsStatic> => {
  throw "web mod enot yet implemented";
};

export const initializeSqlJs = async (mode: RuntimeMode | null = null) => {
  mode = mode ?? detectRuntimeMode();
  switch (mode) {
    case "node":
      return initNodeMode();
    case "web":
      return initWebMode();
  }
  throw `unknown runtime mode: ${mode}`;
};

let cachedSQL: Promise<SqlJsStatic> | null = null;

const getSQL = () => {
  return (cachedSQL = cachedSQL ?? initializeSqlJs());
};

export default getSQL
