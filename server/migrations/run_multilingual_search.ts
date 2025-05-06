import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeWithRetry, pool } from '../db';

// Convert import.meta.url to a file path for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMultilingualSearchMigration() {
  console.log('Starting multilingual search migration...');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '20250506_add_multilingual_search.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL by ; to execute each statement separately
    const statements = sql
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(statement.trim().substring(0, 60) + '...');
      
      await executeWithRetry(async () => {
        const client = await pool.connect();
        try {
          await client.query(statement);
        } finally {
          client.release();
        }
      });
      
      console.log(`Statement ${i + 1} executed successfully.`);
    }
    
    console.log('Multilingual search migration completed successfully.');
  } catch (error) {
    console.error('Error running multilingual search migration:', error);
    throw error;
  }
}

// Run the migration function directly
runMultilingualSearchMigration()
  .then(() => {
    console.log('Migration completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

export { runMultilingualSearchMigration };