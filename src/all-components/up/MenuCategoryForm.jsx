import { useState } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firbase.config';

const MenuCategoryForm = () => {
    const [formData, setFormData] = useState({
        collectionName: 'menu-categories',
        documentName: '',
        order: 0,
        type: 'dropdown',
        items: [{ name: '', path: '' }],
        path: ''
    });

    const [activeTab, setActiveTab] = useState('form'); // 'form' or 'instructions'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [name]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', path: '' }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.documentName) {
                alert('Please enter a document name');
                return;
            }

            const docRef = doc(db, formData.collectionName, formData.documentName);
            const docSnap = await getDoc(docRef);

            let existingData = {};
            if (docSnap.exists()) {
                existingData = docSnap.data();
            }

            const dataToUpdate = {
                ...existingData,
                type: formData.type,
                updatedAt: serverTimestamp()
            };

            if (formData.type === 'link') {
                dataToUpdate.order = Number(formData.order);
            }

            if (formData.type === 'dropdown') {
                const existingItems = existingData.items || [];
                const newItems = formData.items.filter(item => item.name && item.path);
                dataToUpdate.items = [...existingItems, ...newItems];
                dataToUpdate.path = null;
            } else {
                dataToUpdate.path = formData.path;
                dataToUpdate.items = null;
            }

            await setDoc(docRef, dataToUpdate, { merge: true });

            alert('Category saved successfully!');
            setFormData(prev => ({
                ...prev,
                order: 0,
                type: 'dropdown',
                items: [{ name: '', path: '' }],
                path: ''
            }));

        } catch (error) {
            console.error('Error saving document: ', error);
            alert(`Error saving category: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto px-4 ">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('form')}
                >
                    Menu Form
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'instructions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('instructions')}
                >
                    নির্দেশনা
                </button>
            </div>

            {/* Form Tab - Kept in English */}
            {activeTab === 'form' && (
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add/Edit Menu Category</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Document Name */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Document Name (ID):</label>
                                <input
                                    type="text"
                                    name="documentName"
                                    value={formData.documentName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">Type:</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="dropdown">Dropdown</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>

                            {/* Order Input - Only shown for link type */}
                            {formData.type === 'link' && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Order:</label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Position in menu (0 = first item)</p>
                                </div>
                            )}

                            {/* Conditional Fields */}
                            {formData.type === 'dropdown' ? (
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Subcategories:</label>
                                    <div className="space-y-4">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder="Subcategory Name"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        name="path"
                                                        placeholder="Path (e.g., /category/women)"
                                                        value={item.path}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        + Add Subcategory
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Path:</label>
                                    <input
                                        type="text"
                                        name="path"
                                        value={formData.path}
                                        onChange={handleChange}
                                        placeholder="e.g., /about-us"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Format: /category/your-menu-name (use hyphens for spaces)</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instructions Tab - Translated to Bengali */}
            {activeTab === 'instructions' && (
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">মেনু ব্যবস্থাপনা নির্দেশনা</h2>

                        <div className="space-y-8">
                            {/* Menu Creation Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-4 text-red-500 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    মেনু তৈরির নির্দেশনা
                                </h3>
                                <ul className="space-y-3 list-disc pl-5">
                                    <li className="text-gray-700">
                                        <span className="font-medium">ডকুমেন্ট নাম:</span> এটি হবে আপনার মেনুর নাম (যেমন: "নারী", "পুরুষ", "ইলেকট্রনিক্স")
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">ধরণ নির্বাচন:</span> প্রধান মেনু আইটেমের জন্য "লিংক" নির্বাচন করুন
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">অর্ডার নম্বর:</span> মেনুতে অবস্থান নির্ধারণ করে (0 = প্রথম আইটেম, 1 = দ্বিতীয় আইটেম, ইত্যাদি)
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">পাথ ফরম্যাট:</span> অবশ্যই <code className="bg-gray-100 px-1 rounded">/category/</code> দিয়ে শুরু করতে হবে এবং ছোট হাতের অক্ষরে লিখতে হবে
                                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                            <p className="text-sm font-mono">সঠিক: /category/nari-fashion</p>
                                            <p className="text-sm font-mono">ভুল: /nari-fashion বা /Category/NariFashion</p>
                                        </div>
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">একাধিক শব্দ:</span> পাথে শব্দগুলির মধ্যে হাইফেন ব্যবহার করুন
                                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                            <p className="text-sm font-mono">সঠিক: /category/purush-juta</p>
                                            <p className="text-sm font-mono">ভুল: /category/purush juta বা /category/purushJuta</p>
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            {/* Subcategory Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-4 text-blue-500 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    সাবক্যাটেগরি তৈরির নির্দেশনা
                                </h3>
                                <ul className="space-y-3 list-disc pl-5">
                                    <li className="text-gray-700">
                                        <span className="font-medium">মূল মেনু:</span> ডকুমেন্ট নামে একটি বিদ্যমান মেনুর নাম লিখুন
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">ধরণ নির্বাচন:</span> সাবক্যাটেগরির জন্য "ড্রপডাউন" নির্বাচন করুন
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">সাবক্যাটেগরি নাম:</span> সাবমেনু আইটেমের প্রদর্শন নাম
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">সাবক্যাটেগরি পাথ:</span> প্রধান মেনুর মতই নিয়ম অনুসরণ করুন
                                        <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                            <p className="text-sm font-mono">উদাহরণ: /category/nari/juta</p>
                                        </div>
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-medium">একাধিক সাবক্যাটেগরি:</span> একাধিক সাবক্যাটেগরি যোগ করতে "+ Add Subcategory" বাটনে ক্লিক করুন
                                    </li>
                                </ul>
                            </section>

                            {/* Examples Section */}
                            <section>
                                <h3 className="text-xl font-semibold mb-4 text-green-500 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    উদাহরণ
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">প্রধান মেনু:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">ডকুমেন্ট নাম:</span> Home <span className="font-mono bg-gray-100 px-2 py-1 rounded">অর্ডার:</span> 0 <span className="font-mono bg-gray-100 px-2 py-1 rounded">পাথ:</span> /category/home</li>
                                        <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">ডকুমেন্ট নাম:</span> Women <span className="font-mono bg-gray-100 px-2 py-1 rounded">অর্ডার:</span> 1 <span className="font-mono bg-gray-100 px-2 py-1 rounded">পাথ:</span> /category/women</li>
                                    </ul>

                                    <h4 className="font-medium mt-4 mb-2">সাবক্যাটেগরি:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">ডকুমেন্ট নাম:</span> Women <span className="font-mono bg-gray-100 px-2 py-1 rounded">সাবক্যাটেগরি নাম:</span> Dresses <span className="font-mono bg-gray-100 px-2 py-1 rounded">পাথ:</span> /category/women/dresses</li>
                                        <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">ডকুমেন্ট নাম:</span> Women <span className="font-mono bg-gray-100 px-2 py-1 rounded">সাবক্যাটেগরি নাম:</span> Tops <span className="font-mono bg-gray-100 px-2 py-1 rounded">পাথ:</span> /category/women/tops</li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuCategoryForm;