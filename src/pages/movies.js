import { useState } from 'react';
import Image from "next/image";
import styles from "../app/page.module.css";
import "../app/globals.css";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MovieQueries() {
    const router = useRouter();
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedQuery, setSelectedQuery] = useState('');

    const handleMovieChange = (event) => {
        setSelectedMovie(event.target.value);
    };

    const handleQuerySelect = (query) => {
        setSelectedQuery(query);
    };

    const handleSearch = () => {
        console.log('Search clicked:', selectedMovie, selectedQuery);
        if (selectedMovie && selectedQuery) {
            router.push(`/movieResults?movie=${selectedMovie}&query=${selectedQuery}`);
        }
    };

    return (
        <main className={styles.actorsPage}>
            <Link href="/">
                <button className={styles.backButton}>Home</button>
            </Link>
            <div className={styles.headers}>
                <h4>MOVIE QUERIES</h4>
            </div>

            <div className={styles.description}>
                <p>Choose a movie, then select one of the queries below and press search to perform the query with the movie you chose.</p>
            </div>

            <div className={styles.dropdown}>
                <label htmlFor="movies" className={styles.dropdownLabel}>Select a movie:</label>
                <select id="movies" value={selectedMovie} onChange={handleMovieChange}>
                    <option value="">Choose from list</option>
                    <option value="movie1">Movie 1</option>
                    <option value="movie2">Movie 2</option>
                    {/* add actual movie options */}
                </select>
            </div>

            <div className={styles.description}>
                <p>Select a query:</p>
            </div>

            <div className={styles.grid}>
                <div
                    className={`${selectedQuery !== 'query1' && styles.card} ${selectedQuery === 'query1' && styles.selected}`}
                    onClick={() => handleQuerySelect('query1')}
                >
                    <h2>Query 1: Similarity Within Decade of Release</h2>
                    <p>For any given movie, find the genre of the film and plot the number of movies in this genre with a similar rating to the given movie (within a 0.5 margin) as a function of years (within 5 years of the given movie’s release date)</p>
                </div>

                <div
                    className={`${selectedQuery !== 'query2' && styles.card} ${selectedQuery === 'query2' && styles.selected}`}
                    onClick={() => handleQuerySelect('query2')}
                >
                    <h2>Query 2: Ratings over the years</h2>
                    <p>To determine if sentiment towards a movie has shifted over time, for any given movie, plot how the average of ratings given to the film in each year have changed from the release date of the film until the most recent rating.</p>
                </div>

                <div
                    className={`${selectedQuery !== 'query3' && styles.card} ${selectedQuery === 'query3' && styles.selected}`}
                    onClick={() => handleQuerySelect('query3')}
                >
                    <h2>Query 3: Success of Director in this Genre</h2>
                    <p>For any given movie, find the film’s director and genre and plot the ratings of the director’s other films in this genre over their career.</p>
                </div>
            </div>

            <button className={styles.searchButton} onClick={handleSearch}>Search</button>
        </main>
    );
}
