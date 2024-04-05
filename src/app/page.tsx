import Image from "next/image";
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
                        href="/actors"
                        className={styles.card}
                    >
                        <h2>
                            ACTORS
                        </h2>
                        <p>Click here to discover insights about actors, including ratings in best genres, directors, and co-actors.</p>
                    </a>

                    <a
                        href="/movies"
                        className={styles.card}
                    >
                        <h2>
                            MOVIES
                        </h2>
                        <p>Click here to find trends in movies, such as decade-based similarity, ratings over the years, and director success in genres.</p>
                    </a>
                </div>
            </main>
        </div>
    );
}
