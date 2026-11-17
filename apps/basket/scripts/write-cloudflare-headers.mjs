import { writeFile } from "node:fs/promises";

await writeFile(
  new URL("../dist/_headers", import.meta.url),
  "/*\n  Access-Control-Allow-Origin: *\n\n/*.js\n  Cache-Control: public,max-age=31536000,immutable\n",
  "utf8",
);
