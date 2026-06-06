const mongoose = require('mongoose');
const dns = require('dns');

// Your local/router DNS refuses Node's SRV lookups (querySrv ECONNREFUSED),
// so resolve the mongodb+srv host via Google/Cloudflare DNS instead.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;