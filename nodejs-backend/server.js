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
    user: "c.kroll",
    password: "tUmKQmjdMsgzKVIoz6kXT9R7",
    connectString: "oracle.cise.ufl.edu/orcl"
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
        const { startYear, endYear } = req.query;

        const connection = await oracledb.getConnection(dbConfig);

        // Query 1: User Rating Variability
        
        const query1 = `
           WITH user_rating_variability AS (
    SELECT EXTRACT(YEAR FROM TO_DATE( '1970-01-01', 'YYYY-MM-DD' ) + NUMTODSINTERVAL( r.ratingstimestamp, 'SECOND' )) AS ratingYear,
           r.userId,
           STDDEV(r.starrating) AS Rating_Standard_Deviation
    FROM CARBAJALC.ratings r
    WHERE TO_DATE(:startYear, 'YYYY') <= TO_DATE( '1970-01-01', 'YYYY-MM-DD' ) + NUMTODSINTERVAL( r.ratingstimestamp, 'SECOND' )
    AND TO_DATE(:endYear, 'YYYY') >= TO_DATE( '1970-01-01', 'YYYY-MM-DD' ) + NUMTODSINTERVAL( r.ratingstimestamp, 'SECOND' )
    GROUP BY EXTRACT(YEAR FROM TO_DATE( '1970-01-01', 'YYYY-MM-DD' ) + NUMTODSINTERVAL( r.ratingstimestamp, 'SECOND' )), r.userid
)
SELECT ratingYear,
       ROUND(AVG(Rating_Standard_Deviation), 2) AS Average_Rating_Std_Deviation
FROM user_rating_variability
GROUP BY ratingYear
ORDER BY ratingYear
        `;
        
        const result1 = await connection.execute(query1, [ startYear, endYear ]);
  
// Query 2: Rating Trends
        
        
        const query2 = `
            WITH RatingTrends AS (
    SELECT
        m.title,
        EXTRACT(MONTH FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')) AS rating_month,
        EXTRACT(YEAR FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')) AS rating_year,
        ROUND(AVG(r.starrating), 2) AS avg_rating
    FROM
        CARBAJALC.movie m
        INNER JOIN CARBAJALC.ratings r ON m.movieid = r.movieid
    WHERE
        TO_DATE(:startYear, 'YYYY') <= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
        AND TO_DATE(:endYear, 'YYYY') >= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
    GROUP BY
        m.title,
        EXTRACT(YEAR FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')),
        EXTRACT(MONTH FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'))
    ORDER BY
        m.title,
        EXTRACT(YEAR FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')),
        EXTRACT(MONTH FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'))
)
SELECT
    rating_year,
    ROUND(AVG(moving_avg_rating), 2) AS moving_avg_rating
FROM (
    SELECT
        rating_year,
        AVG(avg_rating) OVER (PARTITION BY rating_year ORDER BY rating_month ROWS BETWEEN 12 PRECEDING AND CURRENT ROW) AS moving_avg_rating
    FROM
        RatingTrends
)
GROUP BY
    rating_year
ORDER BY
    rating_year
        `;
        
        const result2 = await connection.execute(query2, [startYear, endYear]);
        
        console.log('response1:', result1);
        console.log('response2:', result2);



        // Combine and send results
        res.json({ userRatingVariability: result1.rows, ratingTrends: result2.rows });
        

        try {
            await connection.close();
        } catch (error) {
            console.error('Error closing database connection:', error);
        }

        
        
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/query3', async (req, res) => {
    try {
        const { startYear, endYear, day, genre } = req.query;

        const connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
SELECT
    TO_CHAR(m.RELEASEDATE, 'YYYY') AS Release_Year,
    ROUND(AVG(r.STARRATING), 2) AS Avg_Rating
FROM
    carbajalc.MOVIE m
JOIN carbajalc.RATINGS r ON m.MOVIEID = r.MOVIEID
WHERE
    TO_CHAR(m.RELEASEDATE, 'Day') LIKE '%'  :day  '%'
    AND JSON_VALUE(m.GENRE, '$[*].name' IS NOT NULL
    AND EXTRACT(YEAR FROM m.RELEASEDATE) BETWEEN :startYear AND :endYear
GROUP BY
    TO_CHAR(m.RELEASEDATE, 'D'), TO_CHAR(m.RELEASEDATE, 'Day'), TO_CHAR(m.RELEASEDATE, 'YYYY'), JSON_VALUE(m.GENRE, '$[*].name')
ORDER BY
    Release_Year
`, [startYear, endYear, day]);


    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

// Define API endpoint for Query 4
app.get('/api/query4', async (req, res) => {
    try {
        const { startYear, endYear } = req.query;
        if (!startYear || !endYear) {
            return res.status(400).json({ error: 'Start year and end year are required' });
        }
        const connection = await oracledb.getConnection(dbConfig);

        // Execute SQL query
        const result = await connection.execute(`
            WITH ActorRatingStats AS (
                SELECT
                    a.actor_name,
                    m.title,
                    EXTRACT(YEAR FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')) AS rating_year,
                    ROUND(AVG(r.rating), 2) AS avg_rating,
                    COUNT(*) AS num_ratings
                FROM
                    CARBAJALC.movies m
                    JOIN CARBAJALC.movie_actors ma ON m.movieId = ma.movieId
                    JOIN CARBAJALC.actors a ON ma.actorId = a.actorId
                    JOIN CARBAJALC.ratings r ON m.movieId = r.movieId
                WHERE 
                    TO_DATE(:startYear, 'YYYY') <= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                    AND TO_DATE(:endYear, 'YYYY') >= TO_DATE('1970', 'YYYY') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND')
                GROUP BY
                    a.actor_name, m.title, EXTRACT(YEAR FROM TO_DATE('1970-01-01', 'YYYY-MM-DD') + NUMTODSINTERVAL(r.ratingstimestamp, 'SECOND'))
            ),
            ActorRatingTrends AS (
                SELECT
                    actor_name,
                    rating_year,
                    AVG(avg_rating) AS avg_rating,
                    AVG(num_ratings) AS avg_num_ratings,
                    AVG(avg_rating) OVER (PARTITION BY actor_name ORDER BY rating_year ROWS BETWEEN 12 PRECEDING AND CURRENT ROW) AS moving_avg_rating
                FROM
                    ActorRatingStats
            )
            SELECT
                actor_name,
                rating_year,
                avg_rating,
                moving_avg_rating,
                avg_num_ratings
            FROM
                ActorRatingTrends
            ORDER BY
                actor_name,
                rating_year
        `, [startYear, endYear]);

        // Send query results to frontend
        res.json(result.rows);

        await connection.close();
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
                    CARBAJALC.ratings r
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


// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
