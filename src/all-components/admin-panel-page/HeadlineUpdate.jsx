import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../firbase.config';

const HeadlineUpdate = () => {
    const [news, setNews] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [docId, setDocId] = useState('');

    // Fetch the first document from headline collection on component mount
    useEffect(() => {
        const fetchHeadline = async () => {
            setLoading(true);
            setError('');
            try {
                const querySnapshot = await getDocs(collection(db, 'headline'));

                if (!querySnapshot.empty) {
                    // Get the first document
                    const firstDoc = querySnapshot.docs[0];
                    setDocId(firstDoc.id);
                    setNews(firstDoc.data().news || '');
                } else {
                    setError('No documents found in headline collection');
                }
            } catch (err) {
                setError('Failed to fetch headline: ' + err.message);
                console.error("Error fetching documents: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHeadline();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!docId) {
            setError('No document found to update');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const docRef = doc(db, 'headline', docId);
            await updateDoc(docRef, {
                news: news
            });
            setSuccess('News updated successfully!');
        } catch (err) {
            setError('Failed to update news: ' + err.message);
            console.error("Error updating document: ", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Headline News</h1>

            {loading && <div className="mb-4 text-blue-600">Loading...</div>}
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {success && <div className="mb-4 text-green-600">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="news" className="block text-sm font-medium text-gray-700 mb-1">
                        News Content *
                    </label>
                    <textarea
                        id="news"
                        value={news}
                        onChange={(e) => setNews(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="6"
                        placeholder="Enter news content here..."
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Updating...' : 'Update News'}
                </button>
            </form>
        </div>
    );
};

export default HeadlineUpdate;