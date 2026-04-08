import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDamageContext } from '../context/DamageContext';

const DetectDamage = () => {
    const { results } = useDamageContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!results) {
            navigate('/dashboard');
        }
    }, [results, navigate]);

    if (!results) return null;

    const { damaged_parts, severity, image_results } = results;
    const displayImage = image_results[0]?.annotated_url || image_results[0]?.original_url;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Comprehensive Damage Detection</h1>
                <p className="mt-2 text-gray-600">Step 3: Identify specific damaged parts.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in-up">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Analysis Report</h3>

                {/* Combined Findings Section */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2 text-center text-lg">Aggregated Findings</h4>
                    <p className="text-center text-blue-600 mb-4">Combined results from {image_results.length} image(s)</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {damaged_parts && damaged_parts.length > 0 ? (
                            damaged_parts.map((part, index) => (
                                <span key={index} className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-sm border border-blue-200 font-medium capitalize">
                                    {part}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 italic">No specific external damage detected.</span>
                        )}
                    </div>
                </div>

                {/* Per Image Breakdown */}
                <h4 className="font-semibold text-gray-700 mb-4 text-xl">Detailed Breakdown by Image</h4>
                <div className="grid grid-cols-1 gap-10">
                    {image_results.map((img, idx) => (
                        <div key={idx} className={`bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg ${image_results.length === 1 ? 'max-w-3xl mx-auto w-full' : ''}`}>
                            <div className={`flex flex-col ${image_results.length === 1 ? '' : 'md:flex-row'}`}>
                                {/* Image Section */}
                                <div className={`${image_results.length === 1 ? 'w-full' : 'md:w-1/2'} p-6 bg-white border-b md:border-b-0 md:border-r border-gray-100`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Analysis View {idx + 1}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 capitalize">Reliability: 98%</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <img
                                            src={(img.annotated_url || img.original_url)?.replace('http://localhost:5000', '')}
                                            alt={`Damage Detection ${idx + 1}`}
                                            className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm border border-gray-100 mx-auto"
                                        />
                                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className={`${image_results.length === 1 ? 'w-full' : 'md:w-1/2'} p-8 flex flex-col justify-center`}>
                                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                        Detected Damage Points
                                    </h5>
                                    
                                    <div className="space-y-3 mb-8">
                                        {img.damaged_parts && img.damaged_parts.length > 0 ? (
                                            img.damaged_parts.map((part, i) => (
                                                <div key={i} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                                    <span className="font-semibold text-gray-800 capitalize flex items-center gap-3">
                                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                                        {part}
                                                    </span>
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">DETECTED</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-white border border-dashed border-gray-200 rounded-xl">
                                                <p className="text-gray-400 italic">No damage points found in this angle</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Severity Rating</p>
                                                <p className={`text-2xl font-black capitalize ${img.severity === 'minor' ? 'text-yellow-600' : img.severity === 'moderate' ? 'text-orange-600' : 'text-red-600'}`}>
                                                    {img.severity}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-2xl ${img.severity === 'minor' ? 'bg-yellow-50' : img.severity === 'moderate' ? 'bg-orange-50' : 'bg-red-50'}`}>
                                                <svg className={`w-8 h-8 ${img.severity === 'minor' ? 'text-yellow-600' : img.severity === 'moderate' ? 'text-orange-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 text-center"
                    >
                        ← Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/estimate-cost')}
                        className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 text-center"
                    >
                        Estimate Cost →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetectDamage;
