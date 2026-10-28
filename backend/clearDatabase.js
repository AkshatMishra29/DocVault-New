import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('Error: MONGODB_URI is not set in backend/.env');
  process.exit(1);
}

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections.`);

    for (const collection of collections) {
      const count = await collection.countDocuments();
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName} (${count} documents deleted)`);
    }

    console.log('\nAll collections in the database have been completely wiped clean!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

clearDatabase();

