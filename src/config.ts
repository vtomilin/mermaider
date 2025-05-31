/**
 * @module config
 *
 * This module provides types and functions to configure the application.
 * It includes configuration interfaces, validation utilities, and helpers
 * for managing application settings.
 */

import { accessSync, constants, readFileSync } from "node:fs";
import process from "node:process";
import util from "node:util";
import type { LaunchOptions } from "puppeteer-core";

/**
 * Error to be returned when invalid launch options are provided.
 * Contains the problematic launch options or error for further inspection.
 */
export class BadLaunchOptions extends Error {
  /**
   * The problematic launch options or error that caused this error.
   */
  readonly launchOptions: LaunchOptions | string | Error;
  /**
   * Initializes a new BadLaunchOptions error.
   * @param {string} message - The error message describing the problem.
   * @param {LaunchOptions|string|Error} launchOptions - The problematic launch options or error that caused this error.
   */
  constructor(message: string, launchOptions: LaunchOptions | string | Error) {
    super(`${message}: ${util.inspect(launchOptions)}`);
    this.name = "BadLaunchConfig";
    this.launchOptions = launchOptions;
  }
}

/**
 * Error to be returned when no configuration file is provided.
 * Used to indicate that the application was started without a config.
 * @extends Error
 */
export class NoConfig extends Error {
  /**
   * Initializes a new NoConfig error.
   * @param {string} message - The error message indicating no configuration file was provided.
   */
  constructor(message: string) {
    super(message);
    this.name = "NoConfig";
  }
}

/**
 * Represents an error that can occur during configuration.
 * This type is a union of {@link BadLaunchOptions} and {@link NoConfig}.
 */
export type ConfigError = BadLaunchOptions | NoConfig;

/**
 * Defines application configuration
 */
export type Config = {
  launchOptions: LaunchOptions;
  // Add your custom configuration properties here
};

function readFile(fileName: string): string | Error {
  try {
    return readFileSync(fileName, "utf8");
  } catch (error) {
    if (error instanceof Error) return error;
  }

  return new Error(`Failed to read file: ${fileName}`);
}

/**
 * Reads the configuration from the command-line. Returns either an instance of {@link Config} or an error.
 * @returns an instance of {@link Config} or {@link ConfigError}
 */
export default function (): Config | ConfigError {
  if (process.argv.length < 3 || !process.argv[2]) {
    return new NoConfig(
      "No config file provided: syntax - `mermaider '{ <inline config>} | <config-file.json>`",
    );
  }

  const configFileNameOrString: string = process.argv[2].trim();
  const launchOptions: string | Error = configFileNameOrString.startsWith("{")
    ? configFileNameOrString
    : readFile(configFileNameOrString);

  if (typeof launchOptions === "string") {
    try {
      const config = JSON.parse(launchOptions) as LaunchOptions;
      // Check to see if required launch options are present
      if (!config.executablePath) {
        return new BadLaunchOptions("Missing Browser executablePath", config);
      }
      try {
        accessSync(config.executablePath, constants.X_OK);
      } catch (error) {
        return new BadLaunchOptions(
          `Browser binary '${config.executablePath}' is not executable`,
          config,
        );
      }
      return {
        launchOptions: config,
      };
    } catch (error) {
      return new BadLaunchOptions(
        `Config file parse error: ${util.inspect(error)}`,
        launchOptions,
      );
    }
  } else {
    return new BadLaunchOptions("Invalid config file", launchOptions);
  }
}
