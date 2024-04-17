import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // Import the styles
import styles from "../app/page.module.css";
import "../app/globals.css";
import { Inter } from "next/font/google";
import Link from 'next/link';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { parseJsonSourceFileConfigFileContent } from 'typescript';

const queries = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chartData1, setChartData1] = useState(null);
    const [chartData2, setChartData2] = useState(null);
    const [chartData3, setChartData3] = useState(null);
    const [chartData4, setChartData4] = useState(null);
    const [chartData5, setChartData5] = useState(null);


    const handleTabSelect = (index) => {
        setSelectedTab(index);
    };

    const handleStartYearChange = (e) => {
        setStartYear(e.target.value);
    };

    const handleEndYearChange = (e) => {
        setEndYear(e.target.value);
    };

    const handleQuery1 = async () => {
        try {
            if (true) {
                setLoading(true); // set loading state to true
                setError(null); // reset error state

                // make HTTP request to backend API
                const response = await axios.get(`http://localhost:5000/api/query1`, {
                    params: {
                        startYear: startYear,
                        endYear: endYear
                        
                    }
                });

                console.log('API response:', response.data);
                

                setChartData1({
                    labels: response.data.map(item => {
                        console.log(item[0]);
                        return parseInt(item[0], 10);
                    }),
                    datasets: [
                        {
                            label: 'Genre Diversity',
                            data: response.data.map(item => {
                                console.log(item[1]);
                                return parseFloat(item[1]);
                            }),
                            fill: false,
                            borderColor: 'rgba(75,192,192,1)',
                            tension: 0.1
                        }
                    ]
                });

            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false); // reset loading state
        }
    };

    const handleQuery2 = async () => {
        try {
            setLoading(true); // set loading state to true
            setError(null); // reset error state
            // Make HTTP request to backend API endpoint query2
            const response = await axios.get('http://localhost:5000/api/query2', {
                params: {
                    startYear: startYear,
                    endYear: endYear
                }
            });


            
            // Extract the data from the response
            const { userRatingVariability, ratingTrends } = response.data;


            console.log('Response data:', response.data);

            const chartData2 = {
                labels: userRatingVariability.map(item => {
                    console.log(item[0]);
                    return parseInt(item[0], 10);
                }),
                datasets: [
                    /*{
                        label: 'Average Rating Standard Deviation',
                        //data: userRatingVariability.map(entry => entry.Average_Rating_Std_Deviation)
                        data: userRatingVariability.map(item => {
                            console.log(item[1]);
                            return parseFloat(item[1]);
                        }),
                        fill: false,
                        borderColor: 'rgba(75,192,192,1)',
                        tension: 0.1
                    }*/
                    {
                        label: 'Moving Average Rating',
                        //data: ratingTrends.map(entry => entry.moving_avg_rating)
                        data: ratingTrends.map(item => {
                            console.log(item[1]);
                            return parseFloat(item[1]);
                        }),
                        fill: false,
                        borderColor: 'rgba(75,192,192,1)',
                        tension: 0.1
                    }
                ]
            };
            

            setChartData2(chartData2);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Internal server error');
        }
        finally {
            setLoading(false); // reset loading state
        }
    };

    // Function to handle Query 4
    const handleQuery4 = async () => {
        try {
            setLoading(true); 
            setError(null);

            // Make HTTP request to backend API for Query 4
            const response = await axios.get('http://localhost:5000/api/query4', {
                params: {
                    startYear: startYear,
                    endYear: endYear
                }
            });

            // Extract data from the response
            const { data } = response;
            console.log('Response data:', data);

            
            setChartData4(data);

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    


    const handleQuery5 = async () => {
        try {
            if (true) {
                setLoading(true); // set loading state to true
                setError(null); // reset error state

                // make HTTP request to backend API
                const response = await axios.get(`http://localhost:5000/api/query5`, {
                    params: {
                        startYear: startYear,
                        endYear: endYear
                        
                    }
                });

                console.log('API response:', response.data);
                

                
                const chartData5 = {
                    /*labels: response.data.map(item => {
                        console.log(item[0]);
                        return parseInt(item[0]);
                    }),*/
                    labels: [],
                    datasets: [] // datasets for each segment
                };
        
                // iterate over response data
                response.data.map(item => {
                    const date = parseInt(item[0]); // month
                    const segment = parseInt(item[1]); // segment
                    const avgRating = parseFloat(item[3]); // average rating
        
                    // if date is new, add it to unique dates
                    if (!chartData5.labels.includes(date)) {
                        chartData5.labels.push(date);
                    }
        
                    // create segment dataset if it doesnt exist
                    if (!chartData5.datasets[segment - 1]) {
                        chartData5.datasets[segment - 1] = {
                            label: `Rating Segment ${segment}`,
                            data: [],
                            fill: false,
                            borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
                            tension: 0.1
                        };
                    }
                    
                    
                    // add average rating to the dataset for the segment
                    chartData5.datasets[segment - 1].data.push(avgRating);
                });
        
                setChartData5(chartData5); 

            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false); // reset loading state
        }
    };

    return (
        <main className={styles.queriesPage}>
            <Link href="/">
                <button className={styles.backButton}>Home</button>
            </Link>
            
            <title>MOVIE TREND QUERIES</title>
           

            <div className={styles.description}>
                <p>Select a query from the tabs below to learn more.</p>
            </div>

            <div className={styles.tab}>
                <Tabs selectedIndex={selectedTab} onSelect={handleTabSelect}>
                    <TabList className={styles.tabList}>
                        <Tab className={styles.tabItem}>Query 1: Genre Diversity Trends Over Time</Tab>
                        <Tab className={styles.tabItem}>Query 2: Ratings Statistics Over Time</Tab>
                        <Tab className={styles.tabItem}>Query 3: Popular Genre Pairings & Rating Trends</Tab>
                        <Tab className={styles.tabItem}>Query 4: User Engagement Trends Over Time</Tab>
                        <Tab className={styles.tabItem}>Query 5: Temporal Analysis of Movie Ratings</Tab>
                    </TabList>

                    <TabPanel>
                        <div className={styles.description}>
                            <p>Analyze the trend of genre diversity over time by calculating the Shannon diversity index for genres applied to movies each year.</p>
                            <a>Enter the years of the start date and the end date that you would like to analyze before submission. The years must be valid from 1903 to 2018.</a>
                        </div>
                        
                        <div className={styles.description}>
                            <label htmlFor="startYear">Start Year: </label>
                            <input type="number" id="startYear" value={startYear} onChange={handleStartYearChange} />
                        </div>
                        <div className={styles.description}>
                            <label htmlFor="endYear">End Year: </label>
                            <input type="number" id="endYear" style={{ marginBottom: '2rem' }} value={endYear} onChange={handleEndYearChange} />
                        </div>
                        {chartData1 && (
                            <div className={styles.description}>
                                <h3>Genre Diversity Over Time</h3>
                                <Line
                                    data={chartData1}
                                    options={{
                                        scales: {
                                            x: {
                                                type: 'linear',
                                                position: 'bottom',
                                                ticks: {
                                                    stepSize: 1 
                                                }
                                            },
                                            y: {
                                                type: 'linear',
                                                position: 'left',
                                                min: 0,
                                                max: 6,
                                                ticks: {
                                                    stepSize: 0.5
                                                }
                                            }
                                        }
                                    }}
                                    plugins={{ legend: false }}
                                />
                            </div>
                        )}

                        <button className={styles.searchButton} onClick={handleQuery1} disabled={loading}>
                            {loading ? 'Loading...' : 'Submit'}
                        </button>
                    </TabPanel>
                    <TabPanel>
                        <div className={styles.description}>
                            <p>Analyze the trend of user rating variability over time by calculating the standard deviation of ratings per user each year. This query also computes the
                                monthly average ratings for each movie, then calculates a 12-month moving average to smooth out fluctuations and identify long-term trends in movie ratings over time.
                                It offers a more comprehensive analysis of movie rating trends.</p>
                            <a>Enter the years of the start date and the end date that you would like to analyze before submission. The years must be valid from 1955 to 2017.</a>
                        </div>

                        <div className={styles.description}>
                            <label htmlFor="startYear">Start Year: </label>
                            <input type="number" id="startYear" value={startYear} onChange={handleStartYearChange} />
                        </div>
                        <div className={styles.description}>
                            <label htmlFor="endYear">End Year: </label>
                            <input type="number" id="endYear" style={{ marginBottom: '2rem' }} value={endYear} onChange={handleEndYearChange} />
                        </div>
                        {chartData2 && (
                            <div className={styles.description}>
                                <h3>Rating Statistics Over Time</h3>
                                <Line
                                    data={chartData2}
                                    options={{
                                        scales: {
                                            x: {
                                                type: 'linear',
                                                position: 'bottom',
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            },
                                            y: {
                                                type: 'linear',
                                                position: 'left',
                                                min: 0,
                                                max: 6,
                                                ticks: {
                                                    stepSize: 0.5
                                                }
                                            }
                                        }
                                    }}
                                    plugins={{ legend: false }}
                                />
                            </div>
                        )}

                        <button className={styles.searchButton} onClick={handleQuery2} disabled={loading}>
                            {loading ? 'Loading...' : 'Submit'}
                        </button>
                    </TabPanel>
                    <TabPanel>
                        {/* Query 3 */}
                    </TabPanel>
                    <TabPanel>
                        {/* Query 4 */}
                        <div className={styles.description}>
                            <p>Analyze the trend of actor rating trends over time.</p>
                            <p>Enter the years of the start date and the end date that you would like to analyze before submission.</p>
                        </div>
                    
                        <div className={styles.description}>
                            <label htmlFor="startYear">Start Year: </label>
                            <input type="number" id="startYear" value={startYear} onChange={handleStartYearChange} />
                        </div>
                        <div className={styles.description}>
                            <label htmlFor="endYear">End Year: </label>
                            <input type="number" id="endYear" style={{ marginBottom: '2rem' }} value={endYear} onChange={handleEndYearChange} />
                        </div>
                        {chartData4 && (
                            <div className={styles.description}>
                                <h3>Actor Rating Trends Over Time</h3>
                                <Line
                                    data={chartData}
                                    options={{
                                        scales: {
                                            x: {
                                                type: 'linear',
                                                position: 'bottom',
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            },
                                            y: {
                                                type: 'linear',
                                                position: 'left',
                                                ticks: {
                                                    stepSize: 0.5
                                                }
                                            }
                                        }
                                    }}
                                    plugins={{ legend: false }}
                                />
                            </div>
                        )}
                    
                        <button className={styles.searchButton} onClick={handleQuery4} disabled={loading}>
                            {loading ? 'Loading...' : 'Submit'}
                        </button>
                    </TabPanel>

                    <TabPanel>
                        {/* Query 5 */}
                        <div className={styles.description}>
                            <p>This query segments users into five groups based on their average monthly ratings and analyzes the distribution of users among these segments over time. 
                                It provides insights into how user preferences and behavior evolve over time, allowing for a deeper understanding of trends in user engagement and satisfaction with movies.</p>
                            <a>Enter the years of the start date and the end date that you would like to analyze before submission. The years must be valid from 1955 to 2017.</a>
                        </div>

                        <div className={styles.description}>
                            <label htmlFor="startYear">Start Year: </label>
                            <input type="number" id="startYear" value={startYear} onChange={handleStartYearChange} />
                        </div>
                        <div className={styles.description}>
                            <label htmlFor="endYear">End Year: </label>
                            <input type="number" id="endYear" style={{ marginBottom: '2rem' }} value={endYear} onChange={handleEndYearChange} />
                        </div>
                        {chartData5 && (
                            <div className={styles.description}>
                                <h3>Rating Statistics Over Time</h3>
                                <Line
                                    data={chartData5}
                                    options={{
                                        scales: {
                                            x: {
                                                type: 'linear',
                                                position: 'bottom',
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            },
                                            y: {
                                                type: 'linear',
                                                position: 'left',
                                                min: 0,
                                                max: 6,
                                                ticks: {
                                                    stepSize: 0.5
                                                }
                                            }
                                        }
                                    }}
                                    plugins={{ legend: false }}
                                />
                            </div>
                        )}

                        <button className={styles.searchButton} onClick={handleQuery5} disabled={loading}>
                            {loading ? 'Loading...' : 'Submit'}
                        </button>
                    </TabPanel>
                </Tabs>
            </div>


            </main>
    );
};

export default queries;
