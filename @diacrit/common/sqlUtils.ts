import { type SqlValue, type Statement } from "sql.js";

export const bindObject = (stmt: Statement, data: Record<string, SqlValue>) =>
  stmt.bind(
    Object.fromEntries(
      Object.entries(data).map(([key, val]) => [`:${key}`, val])
    )
  );
