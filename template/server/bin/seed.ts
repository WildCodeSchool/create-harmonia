// Load environment variables from .env file
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

// Import database client
import database from "../database/client";

import type { AbstractSeeder } from "../database/fixtures/AbstractSeeder";

const fixturesPath = path.join(__dirname, "../database/fixtures");

const seed = async () => {
  try {
    const dependencyMap: { [key: string]: AbstractSeeder } = {};

    // Construct each seeder
    const filePaths = fs
      .readdirSync(fixturesPath)
      .filter((filePath: string) => !filePath.startsWith("Abstract"));

    for (const filePath of filePaths) {
      const { default: SeederClass } = await import(
        path.join(fixturesPath, filePath)
      );

      const seeder = new SeederClass() as AbstractSeeder;

      dependencyMap[SeederClass.toString()] = seeder;
    }

    // Sort seeders according to their dependencies
    const sortedSeeders: AbstractSeeder[] = [];

    // The recursive solver
    const solveDependencies = (n: AbstractSeeder) => {
      for (const DependencyClass of n.dependencies) {
        const dependency = dependencyMap[DependencyClass.toString()];

        if (!sortedSeeders.includes(dependency)) {
          solveDependencies(dependency);
        }
      }

      if (!sortedSeeders.includes(n)) {
        sortedSeeders.push(n);
      }
    };

    // Solve dependencies for each seeder
    for (const seeder of Object.values(dependencyMap)) {
      solveDependencies(seeder);
    }

    // Truncate tables (starting from the depending ones)

    for (const seeder of sortedSeeders.toReversed()) {
      // Use delete instead of truncate to bypass foreign key constraint
      // Wait for the delete promise to complete
      await database.query(`delete from ${seeder.table}`);
    }

    // Run each seeder

    for (const seeder of sortedSeeders) {
      await seeder.run();

      // Wait for all the insertion promises to complete
      // We do want to wait in order to satisfy dependencies
      await Promise.all(seeder.promises);
    }

    // Close the database connection
    database.end();

    console.info(
      `${process.env.DB_NAME} filled from '${path.normalize(fixturesPath)}' 🌱`,
    );
  } catch (err) {
    const { message, stack } = err as Error;
    console.error("Error filling the database:", message, stack);
  }
};

// Run the seed function
seed();
