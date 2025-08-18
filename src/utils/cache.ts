import sqlite3 from "sqlite3";

// If folder cache does not exist, create it
import fs from "fs";
if (!fs.existsSync("cache")) {
  fs.mkdirSync("cache");
}

// SQLite database initialization
const db = new sqlite3.Database("cache/cache.db");

export class Cache {
  static async init() {
    const cache = new Cache("cache");
    await cache.createTableIfNotExists();
    return cache;
  }

  private readonly key: string;

  private constructor(key: string) {
    this.key = key;
  }

  private async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.key} (
        cid TEXT PRIMARY KEY,
        data TEXT
      )
    `;
    await new Promise<void>((resolve, reject) => {
      db.run(query, (err) => {
        if (err) {
          console.error("Error creating table:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public read<T>(cid: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT data FROM ${this.key} WHERE cid = ?`;
      db.get(query, [cid], (err, row: any) => {
        if (err) {
          console.error("Error executing query:", err);
          reject(err);
        } else {
          resolve(row ? JSON.parse(row.data) : null);
        }
      });
    });
  }

  public async add<T>(cid: string, metadata: T) {
    const query = `INSERT INTO ${this.key} (cid, data) VALUES (?, ?)`;
    const data = JSON.stringify(metadata);

    return new Promise<void>((resolve, reject) => {
      db.run(query, [cid, data], (err) => {
        if (err) {
          console.error("Error executing query:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
