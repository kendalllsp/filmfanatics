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
        const { startYear, endYear } = req.query;
        if (!startYear || !endYear) {
            return res.status(400).json({ error: 'Start year and end year are required' });
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Query 1: User Rating Variability
        const query1 = `
            WITH user_rating_variability AS (
                SELECT EXTRACT(YEAR FROM TO_DATE(:startDate, 'YYYY')) AS ratingYear,
                       r.userId,
                       STDDEV(r.starrating) AS Rating_Standard_Deviation
                FROM ratings r
                WHERE TO_DATE(:startDate, 'YYYY') <= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                      AND TO_DATE(:endDate, 'YYYY') >= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                GROUP BY EXTRACT(YEAR FROM TO_DATE(:startDate, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')), r.userid
            )
            SELECT ratingYear,
                   ROUND(AVG(Rating_Standard_Deviation), 2) AS Average_Rating_Std_Deviation
            FROM user_rating_variability
            GROUP BY ratingYear
            ORDER BY ratingYear
        `;
        
        const result1 = await connection.execute(query1, { startDate: startYear, endDate: endYear });
// Query 2: Rating Trends
        const query2 = `
            WITH RatingTrends AS (
                SELECT
                    m.title,
                    EXTRACT(MONTH FROM TO_DATE(:startDate, 'YYYY')) AS rating_month,
                    ROUND(AVG(r.starrating), 2) AS avg_rating
                FROM
                    movie m, ratings r
                WHERE
                    m.movieid = r.movieid
                      AND TO_DATE(:startDate, 'YYYY') <= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                      AND TO_DATE(:endDate, 'YYYY') >= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                GROUP BY
                    m.title,
                    EXTRACT(MONTH FROM TO_DATE(:startDate, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'))
                ORDER BY
                    m.title,
                    EXTRACT(MONTH FROM TO_DATE(:startDate, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'))
            )
            SELECT
                title,
                rating_month,
                avg_rating,
                ROUND(AVG(avg_rating) OVER (PARTITION BY title ORDER BY rating_month ROWS BETWEEN 12 PRECEDING AND CURRENT ROW), 2) AS moving_avg_rating
            FROM RatingTrends
        `;
        
        const result2 = await connection.execute(query2, { startDate: startYear, endDate: endYear });
        
        await connection.close();

        // Combine and send results
        res.json({ userRatingVariability: result1.rows, ratingTrends: result2.rows });
        
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define API endpoint for Query 5
app.get('/api/query5', async (req, res) => {
    try {
        // Extract parameters from request, if any
        const { startYear, endYear } = req.query;
        if (!startYear || !endYear) {
            return res.status(400).json({ error: 'Start year and end year are required' });
        }
        const connection = await oracledb.getConnection(dbConfig);

        // execute SQL query
        const result = await connection.execute(`
            WITH UserRatingStats AS (
                SELECT
                    r.userId,
                    TRUNC(TO_DATE(1970, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'), 'MONTH') AS rating_month,
                    AVG(r.starrating) AS avg_rating,
                    COUNT(r.starrating) AS num_ratings
                FROM
                    ratings r
                WHERE 
                    TRUNC(TO_DATE(1970, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'), 'MONTH') BETWEEN TO_DATE('01-JAN-' || :startYear, 'DD-MON-YYYY') AND TO_DATE('31-DEC-' || :endYear, 'DD-MON-YYYY')
                GROUP BY
                    r.userId, TRUNC(TO_DATE(1970, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'), 'MONTH')
            ),
            UserSegments AS (
                SELECT
                    userId,
                    rating_month,
                    avg_rating,
                    num_ratings,
                    NTILE(5) OVER (PARTITION BY rating_month ORDER BY avg_rating DESC) AS rating_segment
                FROM
                    UserRatingStats
            )
            SELECT
                rating_month,
                rating_segment,
                COUNT(DISTINCT userId) AS num_users,
                ROUND(AVG(avg_rating), 2) AS avg_rating,
                ROUND(AVG(num_ratings), 2) AS avg_num_ratings
            FROM
                UserSegments
            GROUP BY
                rating_month,
                rating_segment
            ORDER BY
                rating_month,
                rating_segment
        `, [startYear, endYear]);

        // send query results to frontend
        res.json(result.rows);

        await connection.close();
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define API endpoint for Query 6
app.get('/api/query6', async (req, res) => {
    try {
         const { startYear, endYear } = req.query;
        if (!startYear || !endYear) {
            return res.status(400).json({ error: 'Start year and end year are required' });
        }
        const connection = await oracledb.getConnection(dbConfig);

        // execute SQL query
        const result = await connection.execute(`
WITH ActorRatingStats AS (
    SELECT
        a.actor_name,
        m.title,
	TRUNC(TO_DATE(1970, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'), 'MONTH') AS rating_month,
        AVG(r.rating) AS avg_rating,
        COUNT(*) AS num_ratings
    FROM
        movies m
    JOIN
        movie_actors ma ON m.movieId = ma.movieId
    JOIN
        actors a ON ma.actorId = a.actorId
    JOIN
        ratings r ON m.movieId = r.movieId
    GROUP BY
        a.actor_name, m.title, TRUNC(TO_DATE(1970, 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'), 'MONTH') AS rating_month,

),

ActorRatingTrends AS (
    SELECT
        actor_name,
        rating_month,
        AVG(avg_rating) AS avg_rating,
        AVG(num_ratings) AS avg_num_ratings,
        AVG(avg_rating) OVER (PARTITION BY actor_name ORDER BY rating_month ROWS BETWEEN 12 PRECEDING AND CURRENT ROW) AS moving_avg_rating
    FROM
        ActorRatingStats
)

SELECT
    actor_name,
    rating_month,
    avg_rating,
    moving_avg_rating,
    avg_num_ratings
FROM
    ActorRatingTrends
ORDER BY
    actor_name,
    rating_month;
`);

        // results go to frontend
        res.json(result.rows);

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
