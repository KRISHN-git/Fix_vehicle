import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

import ReactMarkdown from 'react-markdown';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    // --- Prepare Chart Data ---

    // 1. Car Type Distribution (Pie Chart)
    const carTypes = Object.keys(stats.car_type_distribution);
    const carCounts = Object.values(stats.car_type_distribution);

    const carTypeData = {
        labels: carTypes,
        datasets: [
            {
                label: '# of Assessments',
                data: carCounts,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // 2. Severity Distribution (Bar Chart)
    const severities = ['minor', 'moderate', 'severe']; // Fixed order
    const severityCounts = severities.map(s => stats.severity_distribution[s] || 0);

    const severityData = {
        labels: severities.map(s => s.charAt(0).toUpperCase() + s.slice(1)), // Capitalize
        datasets: [
            {
                label: 'Assessments by Severity',
                data: severityCounts,
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)', // Yellow for Minor
                    'rgba(255, 159, 64, 0.6)', // Orange for Moderate
                    'rgba(255, 99, 132, 0.6)', // Red for Severe
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Damage Severity Distribution',
            },
        },
    };



    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/analytics/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(res.data.summary);
        } catch (err) {
            console.error("Summary error:", err);
            // Optional: toast error
        } finally {
            setLoadingSummary(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <button
                    onClick={handleGenerateSummary}
                    disabled={loadingSummary}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loadingSummary ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <span>✨</span> Get AI Insights
                        </>
                    )}
                </button>
            </div>

            {/* AI Summary Card */}
            {summary && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border border-indigo-100 dark:border-gray-700 p-6 rounded-xl shadow-sm mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🤖</span>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">AI Executive Summary</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-indigo-50 dark:border-gray-700/50">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Assessments</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats.total_assessments}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Avg. Repair Cost</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">₹{stats.average_cost.toLocaleString()}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Severity Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <Bar options={barOptions} data={severityData} />
                </div>

                {/* Car Type Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h3 className="text-gray-600 dark:text-gray-300 font-bold mb-4">Vehicle Types Processed</h3>
                    <div className="w-full max-w-xs">
                        <Pie data={carTypeData} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Analytics;
