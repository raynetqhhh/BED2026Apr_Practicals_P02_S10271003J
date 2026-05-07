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
//Post route - create's new student
app.post("/students", async (req, res) => {
  const newStudentData = req.body;
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `INSERT INTO Students (name, address) VALUES (@name, @address); SELECT SCOPE_IDENTITY() AS student_id;`;
    const request = connection.request();
    request.input("name", newStudentData.name);
    request.input("address", newStudentData.address);
    const result = await request.query(sqlQuery);
    const newStudentId = result.recordset[0].student_id;
    //fetch the newly created student record to return in the response
    const getNewStudentQuery = `SELECT studentid, name, address FROM Students WHERE studentid = @student_id`;
    const getNewStudentRequest = connection.request();
    getNewStudentRequest.input("id", newStudentId);
    const newStudentResult =
      await getNewStudentRequest.query(getNewStudentQuery);
    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
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
//put route - update existing student
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const updatedStudentData = req.body;
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `UPDATE Students SET name = @name, address = @address WHERE studentid = @studentid; SELECT @@ROWCOUNT AS affectedRows;`;
    const request = connection.request();
    request.input("id", studentId);
    request.input("name", updatedStudentData.name);
    request.input("address", updatedStudentData.address);
    await request.query(sqlQuery);
    //fetch updated student to return it.
    const getUpdatedStudentQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @id`;
    const getUpdatedStudentRequest = connection.request();
    getUpdatedStudentRequest.input("id", studentId);
    const updatedStudentResult = await getUpdatedStudentRequest.query(
      getUpdatedStudentQuery,
    );

    if (updatedStudentResult.recordset.length === 0) {
      return res.status(404).send("Student not found");
    }

    res.status(200).json(updatedStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in PUT /students/:id:", error);
    res.status(500).send("Error updating student");
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
//delete route - delete existing student
app.delete("/students/:id", async (req, res) => {
  const studentId = req.params.id;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // First, check if the student exists
    const checkStudentQuery = `SELECT student_id FROM Students WHERE student_id = @id`;
    const checkRequest = connection.request();
    checkRequest.input("id", studentId);
    const checkResult = await checkRequest.query(checkStudentQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).send("Student not found");
    }

    // Delete the student
    const sqlQuery = `DELETE FROM Students WHERE student_id = @id;`;
    const request = connection.request();
    request.input("id", studentId);
    await request.query(sqlQuery);

    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /students/:id:", error);
    res.status(500).send("Error deleting student");
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
