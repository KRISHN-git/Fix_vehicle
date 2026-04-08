import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDamageContext } from '../context/DamageContext';

const EstimateCost = () => {
    const { results } = useDamageContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!results) {
            navigate('/dashboard');
        }
    }, [results, navigate]);

    if (!results) return null;

    const { estimated_cost, car_type, severity, damaged_parts, image_results } = results;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Repair Cost Estimation</h1>
                <p className="mt-2 text-gray-600">Final Step: Estimated repair costs.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl animate-fade-in-up border border-gray-100 mb-10 overflow-hidden relative">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0"></div>
                
                <div className="relative z-10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Total Estimated Repair Cost</h3>
                    <div className="flex flex-col items-center">
                        <p className="text-6xl font-black text-green-600 tracking-tight">
                            ₹{estimated_cost?.min_cost?.toLocaleString() || '0'} - ₹{estimated_cost?.max_cost?.toLocaleString() || '0'}
                        </p>
                        <div className="mt-4 flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Verified Analysis
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                    <div className="text-center md:text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle Model</p>
                        <p className="text-xl font-bold text-gray-900 capitalize">{car_type || 'Unknown'}</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Impact Severity</p>
                        <p className={`text-xl font-bold capitalize ${severity === 'minor' ? 'text-yellow-600' : severity === 'moderate' ? 'text-orange-600' : 'text-red-600'}`}>
                            {severity || 'Unknown'}
                        </p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Affected Areas</p>
                        <p className="text-xl font-bold text-gray-900">{damaged_parts?.length || 0} Points</p>
                    </div>
                </div>
            </div>

            {/* Analysis Verification Section */}
            <h4 className="text-2xl font-bold text-gray-900 mb-6 px-2">Visual Evidence & Verification</h4>
            <div className={`grid gap-8 mb-12 ${image_results?.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {image_results?.map((img, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                        <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                            <img
                                src={(img.annotated_url || img.original_url)?.replace('http://localhost:5000', '')}
                                alt={`Analysis View ${idx + 1}`}
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    Angle {idx + 1}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Status</p>
                                <p className="text-sm font-bold text-green-600">Cost Factor Included</p>
                            </div>
                            <div className={`h-1.5 w-1.5 rounded-full ${severity === 'minor' ? 'bg-yellow-400' : severity === 'moderate' ? 'bg-orange-400' : 'bg-red-400'}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center mb-12">
                <p className="text-blue-800 font-medium mb-4">Would you like a detailed summary and expert suggestions?</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => navigate('/summary')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        View Full Summary →
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all"
                    >
                        New Inspection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EstimateCost;
