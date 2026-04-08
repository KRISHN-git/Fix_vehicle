import { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';
import { useDamageContext } from '../context/DamageContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { results, setResults, clearResults } = useDamageContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (files) => {
        setLoading(true);
        setError(null);
        clearResults();

        const formData = new FormData();
        // Append all files with key 'images' (matches backend)
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        try {
            const res = await axios.post('http://localhost:5000/api/analyze_assessment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = res.data;

            // Map backend response to context structure
            // We'll store the raw data for flexibility
            setResults(data);

            // Auto-save to history
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('http://localhost:5000/api/history', {
                    car_type: data.car_type,
                    severity: data.severity,
                    damaged_parts: data.damaged_parts,
                    estimated_cost: data.estimated_cost,
                    // Use the first image as the thumbnail for history, or we can update history schema later
                    images: {
                        car_url: data.image_results[0]?.original_url,
                        severity_url: data.image_results[0]?.annotated_url || data.image_results[0]?.original_url,
                        damage_url: data.image_results[0]?.annotated_url || data.image_results[0]?.original_url
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(err.response?.data?.error || 'Failed to analyze images. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToDetail = (path) => {
        // Data is now in Context, just navigate
        navigate(path);
    };

    const handleReset = () => {
        clearResults();
        setError(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Vehicle Damage Assessment Console
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Upload a single image for a comprehensive analysis including car type, damage severity, specific parts, and repair cost estimation.
                </p>
            </header>

            {/* Upload Section - Hides when results exist */}
            {!results && (
                <div className="mb-12 transition-all duration-500 ease-in-out">
                    <ImageUpload onUpload={handleUpload} title="Start Assessment" loading={loading} />
                    {error && (
                        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center dark:bg-red-900 dark:text-red-100 dark:border-red-700">
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Results Grid - Shows when results exist */}
            {results && (
                <div className="animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Analysis Results</h2>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={() => navigateToDetail('/history')}
                                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center gap-2 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 w-full sm:w-auto"
                            >
                                View History
                            </button>
                            <button
                                onClick={() => navigateToDetail('/summary')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                View Full Summary
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 w-full sm:w-auto"
                            >
                                <span>↻</span> Check Another Vehicle
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Car Type Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Vehicle Type</h3>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full uppercase tracking-wide">Step 1</span>
                                </div>
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {results.image_results.map((res, idx) => (
                                        <img
                                            key={idx}
                                            src={res.original_url?.replace('http://localhost:5000', '')}
                                            alt={`Car ${idx}`}
                                            className="w-full h-24 object-cover rounded-md"
                                        />
                                    ))}
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize mb-4">{results.car_type}</p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => navigateToDetail('/detect-car')}
                                        className="w-full py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 font-medium rounded-md transition-colors text-sm dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Severity Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Damage Severity</h3>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full uppercase tracking-wide">Step 2</span>
                                </div>
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {results.image_results.map((res, idx) => (
                                        <img
                                            key={idx}
                                            src={(res.annotated_url || res.original_url)?.replace('http://localhost:5000', '')}
                                            alt={`Severity ${idx}`}
                                            className="w-full h-24 object-cover rounded-md"
                                        />
                                    ))}
                                </div>
                                <p className={`text-2xl font-bold capitalize mb-4 ${results.severity === 'minor' ? 'text-yellow-500' :
                                    results.severity === 'moderate' ? 'text-orange-500' :
                                        'text-red-600'
                                    }`}>
                                    {results.severity}
                                </p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => navigateToDetail('/analyze-severity')}
                                        className="w-full py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 font-medium rounded-md transition-colors text-sm dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Damage Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Damage Analysis</h3>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full uppercase tracking-wide">Step 3</span>
                                </div>
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {results.image_results.map((res, idx) => (
                                        <img
                                            key={idx}
                                            src={(res.annotated_url || res.original_url)?.replace('http://localhost:5000', '')}
                                            alt={`Damage ${idx}`}
                                            className="w-full h-24 object-cover rounded-md"
                                        />
                                    ))}
                                </div>
                                <div className="mb-4 max-h-40 overflow-y-auto">
                                    <ul className="list-disc pl-5">
                                        {results.damaged_parts.map((part, i) => (
                                            <li key={i} className="text-gray-700 dark:text-gray-300 capitalize">{part}</li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    {results.damaged_parts.length} Parts Detected
                                </p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => navigateToDetail('/detect-damage')}
                                        className="w-full py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 font-medium rounded-md transition-colors text-sm dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cost Estimate Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Cost Estimate</h3>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full uppercase tracking-wide">Step 4</span>
                                </div>
                                <div className="mb-4 h-24 flex items-center justify-center bg-green-50 dark:bg-green-900/30 rounded-md">
                                    <span className="text-4xl text-green-600 dark:text-green-400">💰</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    ₹{results.estimated_cost?.min_cost?.toLocaleString()} - ₹{results.estimated_cost?.max_cost?.toLocaleString()}
                                </p>
                                <div className="mt-auto">
                                    <button
                                        onClick={() => navigateToDetail('/estimate-cost')}
                                        className="w-full py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 font-medium rounded-md transition-colors text-sm dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Dashboard;
