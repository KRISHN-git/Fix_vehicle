import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDamageContext } from '../context/DamageContext';
import ReactMarkdown from 'react-markdown';

const Summary = () => {
    const { results } = useDamageContext();
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!results) {
            navigate('/dashboard');
        }
    }, [results, navigate]);

    if (!results) return null;

    const { car_type, severity, damaged_parts, estimated_cost, image_results } = results;

    const handleGetAdvice = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:5000/api/generate_suggestions', {
                car_type: car_type,
                severity: severity,
                damaged_parts: damaged_parts, // Ensure backend handles list
                estimated_cost: estimated_cost
            });
            setSuggestions(response.data.suggestions);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900">Vehicle Analysis Summary</h1>
                <p className="mt-2 text-lg text-gray-600">Complete overview and expert AI advice.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data Summary */}
                <div className="space-y-6">
                    {/* Analyzed Images Gallery */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="border-b border-gray-100 pb-4 mb-4">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-3">Vehicle Images ({image_results?.length || 0})</h3>
                            <div className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide ${image_results?.length === 1 ? 'justify-center' : ''}`}>
                                {image_results && image_results.length > 0 ? (
                                    image_results.map((img, idx) => (
                                        <div key={idx} className={`relative group shrink-0 ${image_results.length === 1 ? 'w-48 h-48' : 'w-24 h-24'}`}>
                                            <img
                                                src={(img.annotated_url || img.original_url)?.replace('http://localhost:5000', '')}
                                                alt={`View ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-gray-100 shadow-sm cursor-pointer hover:border-blue-400 transition-all"
                                                onClick={() => window.open((img.annotated_url || img.original_url)?.replace('http://localhost:5000', ''), '_blank')}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] p-1 rounded-b-lg text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {img.car_type || 'Unknown'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No images available</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Vehicle Type Consensus</h3>
                            <p className="text-3xl font-bold text-blue-600 capitalize mt-1 mb-2">
                                {car_type || 'Unknown Vehicle'}
                            </p>

                            {image_results && image_results.length > 0 && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">In individual images:</p>
                                    <div className="space-y-2">
                                        {image_results.map((img, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                                                <span className="text-gray-600">Image {idx + 1}</span>
                                                <span className="font-medium text-gray-900 capitalize">{img.car_type || 'Unknown'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Damage & Severity */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Damage Severity</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                                severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {severity}
                            </span>
                        </div>
                        <h4 className="font-semibold text-gray-700 mb-2">Affected Parts:</h4>
                        <div className="flex flex-wrap gap-2">
                            {damaged_parts && damaged_parts.length > 0 ? (
                                damaged_parts.map((part, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200">
                                        {part}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No specific parts detected.</span>
                            )}
                        </div>
                    </div>

                    {/* Cost Estimate */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Estimated Repair Cost</h3>
                        <p className="text-4xl font-extrabold text-green-600">
                            ₹{estimated_cost?.min_cost?.toLocaleString() || '0'} - ₹{estimated_cost?.max_cost?.toLocaleString() || '0'}
                        </p>
                    </div>
                </div>

                {/* Right Column: AI Suggestions */}
                <div className="bg-indigo-50 p-8 rounded-xl shadow-inner border border-indigo-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-900">AI Expert Advice</h2>
                    </div>

                    {!suggestions && !loading && (
                        <div className="text-center py-10">
                            <p className="text-indigo-800 mb-6">Get a professional second opinion based on the analysis data.</p>
                            <button
                                onClick={handleGetAdvice}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md transition-colors w-full"
                            >
                                Generate Action Plan
                            </button>
                            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-indigo-700 font-medium animate-pulse">Consulting with AI Expert...</p>
                        </div>
                    )}

                    {suggestions && (
                        <div className="prose prose-indigo max-w-none text-gray-800 bg-white p-6 rounded-lg shadow-sm">
                            <ReactMarkdown>{suggestions}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Summary;
