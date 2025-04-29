const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'clinic-management-system';
const collectionName = 'users';
const saltRounds = 10;

async function hashUserPasswords() {
  const client = new MongoClient(uri);
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Select database
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    console.log(`Selected database: ${dbName}, collection: ${collectionName}`);

    // Function to check if a password is already hashed (bcrypt hashes start with $2)
    function isHashed(password) {
      return password.startsWith('$2');
    }

    // Hash all passwords in the users collection
    console.log('Starting password hashing...');

    const users = await collection.find({}).toArray();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      if (!user.password) {
        console.log(`Skipping user ${user.email}: No password field`);
        continue;
      }

      if (isHashed(user.password)) {
        console.log(`Skipping user ${user.email}: Password already hashed`);
        continue;
      }

      try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        console.log(`Hashing password for user ${user.email}`);

        // Update the user document
        await collection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`Updated password for user ${user.email}`);
      } catch (error) {
        console.error(`Error hashing password for user ${user.email}: ${error}`);
      }
    }

    console.log('Password hashing completed');
  } catch (error) {
    console.error('Error connecting to MongoDB or processing users:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
hashUserPasswords().catch(console.error);