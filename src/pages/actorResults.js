import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from "next/image";
import styles from "../app/page.module.css";
import "../app/globals.css";
import { Inter } from "next/font/google";
import Link from 'next/link';

export default function ResultsPage() {
    const router = useRouter();
    const { actor, query } = router.query;
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async (actor, query) => {
            try {
                console.log("Performing search for actor:", actor, "with query:", query);
                setSearchResults(`Search results for actor '${actor}' with query '${query}':`);
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        if (actor && query) {
            fetchSearchResults(actor, query);
        }
    }, [actor, query]);

    return (
        <main className={styles.actorsPage}>
            <Link href="/">
                <button className={styles.backButton}>Home</button>
            </Link>
            <div className={styles.headers}>
                <h4>Search Results</h4>
            </div>
            <div className={styles.description}>
                <p>{searchResults}</p>
            </div>
        </main>
    );
}
