import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="text-5xl mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Hero Section */}
            <div className="relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover opacity-40"
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80"
                        alt="Background car"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                </div>

                <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl animate-fade-in-up">
                            <span className="block">Intelligent Vehicle</span>
                            <span className="block text-indigo-400 mt-2">Damage Assessment</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 animate-fade-in-up delay-100 px-4">
                            Upload a photo and get an instant AI-powered analysis of damage severity, affected parts, and estimated repair costs.
                        </p>
                        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4 animate-fade-in-up delay-200 flex flex-col sm:flex-row px-4 sm:px-0">
                            <Link
                                to="/dashboard"
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                            >
                                {user ? "Go to Dashboard" : "Start Free Assessment"}
                            </Link>
                            {!user && (
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-100 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg transition-all"
                                >
                                    Login to Account
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon="🚗"
                        title="Car Detection"
                        description="Instantly identifies your vehicle's make and model type."
                    />
                    <FeatureCard
                        icon="⚠️"
                        title="Severity Analysis"
                        description="Grades damage (Minor, Moderate, Severe) to help you prioritize."
                    />
                    <FeatureCard
                        icon="🔍"
                        title="Damage Detection"
                        description="Pinpoints specific parts like bumpers and doors using AI."
                    />
                    <FeatureCard
                        icon="💰"
                        title="Cost Estimation"
                        description="Provides a data-driven repair cost range for your locale."
                    />
                </div>

                {/* AI Assistant Section */}
                <div className="mt-20">
                    <div className="relative bg-indigo-900 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0">
                            <img
                                className="h-full w-full object-cover opacity-20"
                                src="https://images.unsplash.com/photo-1633511090164-b6c8ba8n9f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                                alt="AI Technology"
                            />
                            <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply" />
                        </div>
                        <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between">
                            <div className="max-w-xl">
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                    <span className="block">Powered by Gemini AI</span>
                                    <span className="block text-indigo-300">Expert advice, instantly.</span>
                                </h2>
                                <p className="mt-4 text-lg text-indigo-100">
                                    Get a professional second opinion. Our system not only detects damage but provides actionable repair advice, safety tips, and estimated timelines.
                                </p>
                            </div>
                            <div className="mt-10 lg:mt-0 lg:ml-8">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg shadow-lg"
                                >
                                    Try AI Analysis
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonial Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
                <div className="relative bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden border border-gray-800">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <img
                                    className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-gray-900 shadow-2xl transform transition duration-500 group-hover:scale-105"
                                    src="https://mnnit.ac.in/userprofile/uploads/99837-Web%20pic.jpg"
                                    alt="Project Mentor"
                                />
                                <div className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-2 rounded-full shadow-lg border-2 border-gray-900">
                                    <span className="text-xl">🏆</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1 space-y-6">
                            <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-700/50">
                                <span className="text-yellow-400">★★★★★</span>
                                <span className="text-gray-300 text-sm font-medium tracking-wide">EXCEPTIONAL LEADERSHIP</span>
                            </div>

                            <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-100 leading-relaxed">
                                "This revolutionary platform stands as a monumental achievement, sculpted by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold">visionary genius</span> of our mentor. Their profound expertise and unwavering guidance have been the <span className="text-white font-semibold italic">catalyst</span> for transforming complex AI theories into this robust, real-world solution."
                            </blockquote>

                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="text-2xl font-bold text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    Dr. Satish Chandra
                                </h4>
                                <p className="text-indigo-400 font-medium tracking-wide uppercase text-sm">
                                    Chief AI Architect & Strategy Director
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
