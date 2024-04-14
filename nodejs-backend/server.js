// server.js

const express = require('express');
const oracledb = require('oracledb');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection configuration (using env variables)
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};


// Define API endpoint for Query 1
app.get('/api/query1', async (req, res) => {
    try {
        // Extract parameters from request, if any
        const { actorName, timeRange } = req.query;

        // Connect to Oracle database
        const connection = await oracledb.getConnection(dbConfig);

        // Execute SQL query
        //const result = await connection.execute(`SELECT * FROM table_name WHERE actor = :actorName AND time BETWEEN :startDate AND :endDate`, [actorName, timeRange.startDate, timeRange.endDate]);

        // Send query results to frontend
        //res.json(result.rows);

        // Release the database connection
        await connection.close();
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define API endpoints for other queries similarly...

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
