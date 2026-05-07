const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig.js");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

app.use(express.json()); // to recognize the incoming Request Object as a JSON Object.
app.use(express.urlencoded()); // to recognize the incoming Request Object as strings or arrays

app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Exit with code 1 indicating an error
  }
  console.log(`Server listening on port ${port}`);
});
//close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
