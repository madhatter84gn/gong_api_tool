#!/usr/bin/env node

import { program } from "commander";
const program = new Command();

program
  .version("0.0.1")
  .description(" Gong API CLI")
  .option("-n, --name <type>", "Add your name")
  .action((options) => {
    console.log(`Hey, ${options.name}!`);
  });

program.parse(process.argv);
