import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Helper to extract date from various formats
    const parseDate = (timestamp) => {
        if (!timestamp) return new Date(0);
        if (typeof timestamp === 'object' && timestamp.$date) {
            return new Date(timestamp.$date);
        }
        return new Date(timestamp);
    };

    // Helper to get the best available image URL
    const getImageUrl = (record) => {
        // Priority 1: New multi-image format (Cloudinary)
        if (record.images?.car_url) return record.images.car_url;

        // Priority 2: Old single-image format properties
        if (record.original_image_url) return record.original_image_url;
        if (record.image_url) return record.image_url;

        // Priority 3: String format
        if (typeof record.images === 'string') return record.images;

        return null;
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Sort by timestamp descending (newest first)
                const sortedHistory = response.data.sort((a, b) => {
                    const dateA = parseDate(a.timestamp);
                    const dateB = parseDate(b.timestamp);
                    return dateB - dateA;
                });

                setHistory(sortedHistory);
                console.log("History Data:", history);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Failed to load history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Assessment History</h1>

            {history.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No assessments found.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Start New Assessment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((record) => {
                        const imageUrl = getImageUrl(record);
                        console.log("image:", imageUrl)

                        return (
                            <div key={record._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative group">
                                    <img
                                        src={imageUrl}
                                        alt="Vehicle"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                            {record.car_type || 'Unknown Vehicle'}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${record.severity === 'minor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            record.severity === 'moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {record.severity}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {parseDate(record.timestamp).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>

                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Damaged Parts:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(() => {
                                                let parts = [];
                                                if (Array.isArray(record.damaged_parts)) {
                                                    parts = record.damaged_parts;
                                                } else if (typeof record.damaged_parts === 'string') {
                                                    parts = [record.damaged_parts];
                                                } else if (typeof record.damaged_parts === 'object' && record.damaged_parts !== null) {
                                                    // If it's a dict (legacy single-image data), keys are usually parts
                                                    parts = Object.keys(record.damaged_parts);
                                                }

                                                return (
                                                    <>
                                                        {parts.slice(0, 3).map((part, i) => (
                                                            <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded capitalize">
                                                                {part}
                                                            </span>
                                                        ))}
                                                        {parts.length > 3 && (
                                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                                                +{parts.length - 3} more
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Est. Cost</p>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                ₹{record.estimated_cost?.min_cost?.toLocaleString()} - ₹{record.estimated_cost?.max_cost?.toLocaleString()}
                                            </p>
                                        </div>
                                        {/* Placeholder for detail view if implemented later
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View >
                                    </button>
                                    */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
