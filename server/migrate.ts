import { db, pool } from "./db";
import { resources } from "@shared/schema";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting database migration...");
    
    // Check if subcategory column exists
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'resources' AND column_name = 'subcategory'
    `);
    
    if (result.rows.length === 0) {
      console.log("Adding subcategory column to resources table...");
      
      await db.execute(sql`
        ALTER TABLE resources 
        ADD COLUMN subcategory TEXT
      `);
      
      console.log("Migration successful: subcategory column added");
    } else {
      console.log("Migration skipped: subcategory column already exists");
    }
    
    await pool.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();