// src/database/mongodb.ts
import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectDB() {
  if (db) return db; // Return existing connection (avoid duplicates)

  try {
    const uri:string | undefined = process.env.MONGO_URL

    client = new MongoClient(uri as string);
    await client.connect();
    db = client.db("learning_platform_docs"); // Automatically takes DB name from URI

    console.log("🔥 Mongo connected:", db.databaseName);
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

export { db };