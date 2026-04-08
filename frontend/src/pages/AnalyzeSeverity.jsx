import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDamageContext } from '../context/DamageContext';

const AnalyzeSeverity = () => {
    const { results } = useDamageContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!results) {
            navigate('/dashboard');
        }
    }, [results, navigate]);

    if (!results) return null;

    const { severity, image_results } = results;
    // Use annotated image from first result or fallback to original
    const displayImage = image_results[0]?.annotated_url || image_results[0]?.original_url;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Severity Analysis</h1>
                <p className="mt-2 text-gray-600">Step 2: Determine the severity of the damage.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fade-in-up mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Consensus: <span className={`capitalize ${severity === 'minor' ? 'text-yellow-500' : severity === 'moderate' ? 'text-orange-500' : 'text-red-600'}`}>{severity}</span></h2>

                <div className={`grid gap-6 ${image_results.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {image_results.map((img, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center transition-all hover:shadow-md">
                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full mb-3 self-start">Image {index + 1}</span>
                            <div className="w-full aspect-video mb-4 overflow-hidden rounded-lg shadow-inner bg-gray-100 border border-gray-100">
                                <img
                                    src={(img.annotated_url || img.original_url)?.replace('http://localhost:5000', '')}
                                    alt={`Severity Analysis ${index + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="w-full text-left">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Detected Severity:</p>
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                    <p className={`text-2xl font-black capitalize ${img.severity === 'minor' ? 'text-yellow-500' : img.severity === 'moderate' ? 'text-orange-500' : 'text-red-600'}`}>
                                        {img.severity}
                                    </p>
                                    <div className={`h-3 w-3 rounded-full animate-pulse ${img.severity === 'minor' ? 'bg-yellow-500' : img.severity === 'moderate' ? 'bg-orange-500' : 'bg-red-600'}`}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/detect-damage')}
                        className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Next: Detect Specific Damage →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyzeSeverity;
