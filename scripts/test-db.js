const { initDb, executeQuery } = require('../lib/db');

async function test() {
  console.log('Testing Database initialization...');
  await initDb();
  console.log('DB initialized successfully.');

  const users = await executeQuery('SELECT id, username, name, role FROM users');
  console.log('Total seeded users:', users.length);
  console.table(users);

  // Test standard login
  console.log('\n--- Testing Normal Login ---');
  const normalLogin = await executeQuery("SELECT * FROM users WHERE username = 'admin' AND password = 'admin123'");
  console.log('Normal login result:', normalLogin.length > 0 ? 'Success as ' + normalLogin[0].name : 'Failed');

  // Test SQL Injection Login Bypass: admin' --
  console.log('\n--- Testing SQL Injection Bypass (admin\' --) ---');
  const sqliQuery = "SELECT * FROM users WHERE username = 'admin' --' AND password = 'arbitrary_password'";
  console.log('Query:', sqliQuery);
  const sqliLogin = await executeQuery(sqliQuery);
  console.log('SQL Injection result:', sqliLogin.length > 0 ? 'BYPASSED! Logged in as: ' + sqliLogin[0].username : 'Failed');

  // Test SQL Injection Login Bypass without knowing username: ' OR '1'='1' --
  console.log('\n--- Testing SQL Injection Bypass (\' OR \'1\'=\'1\' --) ---');
  const sqliAnyQuery = "SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = 'whatever'";
  console.log('Query:', sqliAnyQuery);
  const sqliAnyLogin = await executeQuery(sqliAnyQuery);
  console.log('SQL Injection result:', sqliAnyLogin.length > 0 ? 'BYPASSED! Logged in as: ' + sqliAnyLogin[0].username : 'Failed');
}

test().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
