import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const ImageUpload = ({ onUpload, title, loading }) => {
    const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files);

            // Create previews
            const newPreviews = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setPreview(newPreviews);
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // Convert base64 to file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });

                    // Update state to show preview and prepare for upload
                    const fileList = new DataTransfer();
                    fileList.items.add(file);

                    setSelectedFile(fileList.files);
                    setPreview([imageSrc]); // Preview the captured image
                    setMode('upload'); // Switch back to upload view to show the captured image
                });
        }
    }, [webcamRef]);

    const switchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    const resetSelection = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>

            {/* Mode Toggle */}
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    className={`flex-1 py-2 text-sm font-medium ${mode === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setMode('upload')}
                    type="button"
                >
                    Upload Photo
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium ${mode === 'camera' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => {
                        setMode('camera');
                        resetSelection(); // Clear previous selection when switching to camera
                    }}
                    type="button"
                >
                    Take Photo
                </button>
            </div>

            {mode === 'camera' ? (
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode: facingMode
                            }}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex justify-between space-x-2">
                        <button
                            type="button"
                            onClick={switchCamera}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Switch Camera
                        </button>
                        <button
                            type="button"
                            onClick={capture}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Capture
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {preview ? (
                                    Array.isArray(preview) ? (
                                        <div className="grid grid-cols-2 gap-2 w-full px-4 overflow-y-auto max-h-56">
                                            {preview.map((src, idx) => (
                                                <img key={idx} src={src} alt={`Preview ${idx}`} className="h-24 w-full object-cover rounded" />
                                            ))}
                                        </div>
                                    ) : (
                                        <img src={preview} alt="Preview" className="max-h-56 object-contain rounded" />
                                    )
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">Upload multiple photos (MAX. 5MB each)</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        resetSelection();
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                                    title="Clear selection"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            )}
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedFile || loading}
                        className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Upload & Analyze'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ImageUpload;
