const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}
if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
  console.error('Refusing to run drop on localhost. Use Atlas URI.');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const toDrop = ['payrolldrafts', 'payrolldraftitems'];
    for (const name of toDrop) {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        await db.collection(name).drop();
        console.log(`Dropped collection: ${name}`);
      } else {
        console.log(`Collection not found, skipping: ${name}`);
      }
    }
    console.log('Drop complete');
  } catch (err) {
    console.error('Error dropping collections:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (require.main === module) main();
