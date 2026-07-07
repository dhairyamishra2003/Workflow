const mongoose = require('mongoose');

const uri = 'mongodb+srv://dhairyam698_db_user:1234@cluster0.dclqb64.mongodb.net/agentflow_ai?appName=Cluster0&tlsInsecure=true';

async function run() {
  console.log('Connecting with tlsInsecure=true...');
  try {
    await mongoose.connect(uri);
    console.log('Connected successfully!');
    
    // Try a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

run();
