import { useState } from 'react';
import Image from "next/image";
import styles from "../app/page.module.css";
import "../app/globals.css";
import { Inter } from "next/font/google";
import Link from 'next/link';
import axios from 'axios';

export default function Actors() {
    const [selectedActor, setSelectedActor] = useState('');
    const [selectedQuery, setSelectedQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleActorChange = (event) => {
        setSelectedActor(event.target.value);
    };

    const handleQuerySelect = (query) => {
        setSelectedQuery(query);
    };

    const handleSearch = async () => {
        try {
            if (selectedActor && selectedQuery) {
                setLoading(true); // set loading state to true
                setError(null); // reset error state

                // make HTTP request to backend API
                const response = await axios.get(`/api/${selectedQuery}`, {
                    params: {
                        actorName: selectedActor,
                        // add any other parameters for the API
                    }
                });

                console.log('API response:', response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false); // reset loading state
        }
    };


    return (

        <main className={styles.actorsPage}>
            <Link href="/">
                <button className={styles.backButton}>Home</button>
            </Link>
            <div className={styles.headers}>
                <h4>ACTOR QUERIES</h4>
            </div>

            <div className={styles.description}>
                <p>Choose an actor, then select one of the queries below and press search to perform the query with the actor you chose.</p>
            </div>

            <div className={styles.dropdown}>
                <label htmlFor="actors" className={styles.dropdownLabel}>Select an actor:</label>
                <select id="actors" value={selectedActor} onChange={handleActorChange}>
                    <option value="">Choose from list</option>
                    <option value="actor1">Actor 1</option>
                    <option value="actor2">Actor 2</option>
                    {/* add the actual options for actors */}
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
                    <h2>Query 1: Ratings in Best Genre</h2>
                    <p>For the genre an actor most frequently acts in, graph the ratings of their movies in the genre over time, from their first movie in the genre to the most recent.</p>
                </div>

                <div
                    className={`${selectedQuery !== 'query2' && styles.card} ${selectedQuery === 'query2' && styles.selected}`}
                    onClick={() => handleQuerySelect('query2')}
                >
                    <h2>Query 2: Best Director</h2>
                    <p>For an actor, find the director they have most frequently worked with and plot the average ratings of their films together - from the first to the most recent - as a function of years.</p>
                </div>

                <div
                    className={`${selectedQuery !== 'query3' && styles.card} ${selectedQuery === 'query3' && styles.selected}`}
                    onClick={() => handleQuerySelect('query3')}
                >
                    <h2>Query 3: Best Co-actor</h2>
                    <p>For an actor, find the co-actor with whom they have worked the most and plot the average ratings of their films together - from the first to the most recent - as a function of years.</p>
                </div>
            </div>


            <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>

            {error && <p className={styles.error}>{error}</p>} // show error

        </main>
    );
}
