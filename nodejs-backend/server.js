// server.js

const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Database connection configuration (using env variables)
require('dotenv').config();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT
};

// define API endpoint for Query 1
app.get('/api/query1', async (req, res) => {
    try {
        // Extract parameters from request, if any

        const { startYear, endYear } = req.query;
        // start year and end year


        const connection = await oracledb.getConnection(dbConfig);

        // execute SQL query
        const result = await connection.execute(`
WITH genre_counts AS (
    SELECT EXTRACT(YEAR FROM m.RELEASEDATE) AS Year,
           genre.genre_name,
           COUNT(*) AS genre_count
    FROM CARBAJALC.MOVIE m
    CROSS JOIN JSON_TABLE(m.GENRE, '$[*]' COLUMNS (
        genre_id NUMBER PATH '$.id',
        genre_name VARCHAR2(255) PATH '$.name'
    )) AS genre
    WHERE RELEASEDATE BETWEEN TO_DATE('01-JAN-' || :startYear, 'DD-MON-YYYY') AND TO_DATE('31-DEC-' || :endYear, 'DD-MON-YYYY')
    GROUP BY EXTRACT(YEAR FROM m.RELEASEDATE), genre.genre_name
),
movie_counts AS (
    SELECT EXTRACT(YEAR FROM RELEASEDATE) AS Year,
           COUNT(*) AS total_movies
    FROM CARBAJALC.MOVIE
    WHERE RELEASEDATE BETWEEN TO_DATE('01-JAN-' || :startYear, 'DD-MON-YYYY') AND TO_DATE('31-DEC-' || :endYear, 'DD-MON-YYYY')
    GROUP BY EXTRACT(YEAR FROM RELEASEDATE)
)
SELECT gc.Year,
       -SUM((gc.genre_count / mc.total_movies) * LOG((gc.genre_count / mc.total_movies), 2.71828)) AS Genre_Diversity
FROM genre_counts gc
JOIN movie_counts mc ON gc.Year = mc.Year
GROUP BY gc.Year, mc.total_movies
ORDER BY gc.Year
`, [startYear, endYear, startYear, endYear]);

        // send query results to frontend
        res.json(result.rows);

        await connection.close();
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//define other queries

// define API endpoint for Query 2
app.get('/api/query2', async (req, res) => {
    try {
        // extract parameters from request, if any
        const { actorName, timeRange } = req.query;

        // connect to Oracle database
        const connection = await oracledb.getConnection(dbConfig);

        // execute SQL query (example written here)
        //const result = await connection.execute(`SELECT * FROM table_name WHERE actor = :actorName AND time BETWEEN :startDate AND :endDate`, [actorName, timeRange.startDate, timeRange.endDate]);

        // send query results to frontend
        //res.json(result.rows);

        // release the database connection
        await connection.close();
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
