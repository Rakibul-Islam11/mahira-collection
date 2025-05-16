import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firbase.config';

const HeroSliderImageUpload = () => {
    const [documentId, setDocumentId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [idError, setIdError] = useState('');

    const validateDocumentId = (id) => {
        if (id.includes(' ')) {
            setIdError('Document ID cannot contain spaces');
            return false;
        }
        setIdError('');
        return true;
    };

    const handleDocumentIdChange = (e) => {
        const value = e.target.value;
        setDocumentId(value);
        validateDocumentId(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            if (!documentId.trim() || !imageUrl.trim()) {
                throw new Error('Document ID and Image URL are required');
            }

            if (!validateDocumentId(documentId)) {
                throw new Error('Please fix Document ID errors');
            }

            // Validate URL format
            try {
                new URL(imageUrl);
            } catch {
                throw new Error('Please enter a valid URL');
            }

            const docRef = doc(db, 'hero-slider-images', documentId);

            // Set the document with the image URL as an object
            await setDoc(docRef, {
                image: {
                    url: imageUrl,
                    createdAt: new Date().toISOString()
                }
            }, { merge: true });

            setSuccess(true);
            setDocumentId('');
            setImageUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Upload Hero Slider Image</h2>

            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    Image URL successfully added to Firestore!
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="documentId" className="block text-sm font-medium text-gray-700 mb-1">
                        Document ID
                    </label>
                    <input
                        type="text"
                        id="documentId"
                        value={documentId}
                        onChange={handleDocumentIdChange}
                        className={`w-full px-3 py-2 border ${idError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter unique document ID"
                        required
                    />
                    {idError && (
                        <p className="mt-1 text-xs text-red-500">
                            {idError}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-red-500">
                        This document ID will must be without any space with camel case such as (bannerImageThird)
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Enter the full URL of the image you want to add
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || idError}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : (idError ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')} transition-colors`}
                >
                    {loading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Firestore Structure:</h3>
                <div className="text-sm text-gray-600">
                    <p><span className="font-semibold">Collection:</span> hero-slider-images</p>
                    <p><span className="font-semibold">Document ID:</span> Your provided ID (no spaces)</p>
                    <p><span className="font-semibold">Field:</span> image (object)</p>
                    <p><span className="font-semibold">Stored Data:</span> {"{ url: 'your-image-url', createdAt: timestamp }"}</p>
                </div>
            </div>
        </div>
    );
};

export default HeroSliderImageUpload;