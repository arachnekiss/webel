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
    
    // Use a more robust approach for splitting SQL statements 
    // This handles dollar-quoted blocks better
    const statements = [];
    let currentStatement = '';
    let dollarQuoting = false;
    let dollarTag = '';
    
    // Split the SQL correctly handling dollar-quoted blocks
    const lines = sql.split('\n');
    for (const line of lines) {
      // Skip comment lines but include them in the statement
      if (line.trim().startsWith('--')) {
        currentStatement += line + '\n';
        continue;
      }
      
      // Add the line to the current statement
      currentStatement += line + '\n';
      
      // Check for dollar quoting
      if (!dollarQuoting) {
        const match = line.match(/\$\$|\$[a-zA-Z0-9_]*\$/g);
        if (match) {
          dollarQuoting = true;
          dollarTag = match[0];
        }
      } else if (line.includes(dollarTag)) {
        dollarQuoting = false;
        dollarTag = '';
      }
      
      // If we hit a semicolon and we're not inside a dollar-quoted block, 
      // we've completed a statement
      if (!dollarQuoting && line.trim().endsWith(';')) {
        if (currentStatement.trim().length > 0) {
          statements.push(currentStatement);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement);
    }
    
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