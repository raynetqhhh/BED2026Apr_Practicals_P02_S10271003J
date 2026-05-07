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
// get routes
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT studentid, name, address FROM Students`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving students");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});
// GET student by ID
app.get("/students/:id", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT studentid, name, address FROM Students WHERE studentid = @studentid`;
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(sqlQuery);
    if (!result.recordset[0]) {
      return res.status(404).send("Student not found");
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error in GET /students/:id:", error);
    res.status(500).send("Error retrieving student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});
