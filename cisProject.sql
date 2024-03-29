CREATE TABLE Ratings (
    userId INTEGER NOT NULL,
    movieId INTEGER NOT NULL,
    starRating DOUBLE PRECISION NOT NULL,
    ratingTimeStamp DATE,
    PRIMARY KEY (userId, movieId)
);

CREATE TABLE Movie (
    movieId INTEGER NOT NULL,
    title VARCHAR(225),
    genre VARCHAR(225),
    releaseDate DATE,
    PRIMARY KEY (movieId)
);

CREATE TABLE MovieTag (
    tagId INTEGER NOT NULL,
    keyWord VARCHAR(225),
    PRIMARY KEY (tagId)
);

CREATE Table Credits (
    creditsId INTEGER NOT NULL,
    castName VARCHAR(225),
    crewName VARCHAR(225),
    crewJob VARCHAR(225),
    PRIMARY KEY (creditsId)
);

SELECT * FROM Ratings;
SELECT * FROM Movie;
SELECT * FROM MovieTag;
SELECT * FROM Credits;
