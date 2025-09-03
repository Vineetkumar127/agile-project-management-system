const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
