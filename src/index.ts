#!/usr/bin/env node

import { writeFileSync } from "fs";
import * as graphqlToTS from "graphql-to-ts";
import path = require("path");
const argv = require("minimist")(process.argv.slice(2));

function exception(message: string) {
  throw new Error(message);
}

async function main() {
  const cmd = process.argv[2];
  return cmd === "types"
    ? await writeTypes(argv)
    : cmd === "resolvers"
      ? await writeResolvers(argv)
      : cmd === "apolloqueries"
        ? await writeApolloQueries(argv)
        : exception(
            `Invalid option. Valid options are 'types', 'resolvers' and 'apolloqueries'. See https://github.com/jeswin/graphql-to-ts-cli.`
          );
}

async function writeTypes(args: any) {
  const input = require(path.resolve(process.cwd(), args.i)).default;
  const result = graphqlToTS.generateTypes(input);
  writeFileSync(args.o, result);
}

async function writeResolvers(args: any) {
  const input = require(path.resolve(process.cwd(), args.i)).default;
  const opts = {
    apiModule: args.apimodule,
    graphqlModule: args.graphqlmodule,
    parseResultFunctionName: args.parsefuncname,
    parseResultModule: args.parsefuncmodule
  };
  const result = graphqlToTS.generateResolvers(input, opts);
  writeFileSync(args.o, result);
}

async function writeApolloQueries(args: any) {
  const queries = require(path.resolve(process.cwd(), args.i)).default;
  const schema = require(path.resolve(process.cwd(), args.schema)).default;
  const opts = {
    graphqlTypesModule: args.gqltypesmodule
  };
  const result = graphqlToTS.generateApolloQueries(queries, schema, opts);
  writeFileSync(args.o, result);
}

main();
