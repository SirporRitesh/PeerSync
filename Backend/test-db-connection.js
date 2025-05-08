// test-db-connection.js
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://riteshsirpor:riteshsirpor@cluster0.hy6odat.mongodb.net/PeerSync?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB Connected');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });