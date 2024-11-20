#!/usr/bin/env node

// src/index.js
import { Command } from "commander";
import dotenv from "dotenv";
import chalk from "chalk";
import { validateEnvVariables } from "./utils/config.js";
import {
  getAllRawCallHistory,
  getAllExtensiveCallHistory,
  interactive,
} from "./commands/index.js";

dotenv.config();

validateEnvVariables();

const program = new Command();

program
  .name("gong-cli")
  .description("CLI application to manage call history")
  .version("0.0.1");

program
  .command("interactive")
  .description("Run in interactive mode")
  .action(interactive);

if (process.argv.length === 2) {
  interactive();
} else {
  program.parse();
}
