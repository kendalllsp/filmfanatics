import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.homePage}>
            <main className={styles.main}>
                <div className={styles.headers}>
                    <h1>FILM FANATICS</h1>
                </div>
                <div className={styles.headers}>
                    <h3>trend analysis and visualization</h3>
                </div>

                <div className={styles.description}>
                    <p>Explore various queries from a dataset of movie ratings containing approximately 33 million reviews for 86,000 different movies labeled with 19 different genres.</p>
                </div>

                <div className={styles.grid}>
                    <a
                        href="/querySelection"
                        className={styles.card}
                    >
                        <h2>
                            SELECT A QUERY
                        </h2>
                        <p>Click here to discover insights about movies through 5 available queries.</p>
                    </a>

                </div>
            </main>
        </div>
    );
}
