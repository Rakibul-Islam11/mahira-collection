const RetrunAnd = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Return & Exchange Policy</h1>
                <p className="text-gray-500">Effective Date: <span className="font-medium text-indigo-600">19-05-2025</span></p>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                    At Mahira Collection, customer satisfaction is our priority. We strive to ensure that you are happy with your purchase.
                    However, if you face any issues, please read our return and exchange policy below.
                </p>
            </div>

            {/* Policy Sections */}
            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                            Eligibility for Return or Exchange
                        </h2>
                        <p className="text-gray-600 mb-3">Items are eligible for return or exchange only if they are:</p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Damaged or defective</li>
                            <li>Incorrect item received</li>
                        </ul>
                        <p className="text-gray-600 mt-3">
                            You must contact us within 48 hours of receiving the product to report an issue.
                        </p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                            Conditions for Return/Exchange
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Items must be unused, unworn, and in their original packaging with tags intact.</li>
                            <li>Products must be returned in the same condition they were delivered.</li>
                            <li>We do not accept returns for size issues, color preferences, or change of mind.</li>
                            <li>Sale or discounted items are not eligible for return or exchange unless damaged.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                            Return & Exchange Process
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>To request a return or exchange, please contact us via email or phone with your order ID and issue details.</li>
                            <li>Once your request is approved, we will provide instructions for returning the item.</li>
                            <li>Customers are responsible for the return shipping costs unless the product is faulty.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 4 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                            Refunds
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Refunds are only processed if a replacement product is not available.</li>
                            <li>Refunds will be made to the original payment method within 7–10 business days after we receive and inspect the returned item.</li>
                            <li>Shipping charges are non-refundable.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 5 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">5</span>
                            Important Notes
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Any item returned without prior approval will not be accepted.</li>
                            <li>Please keep proof of shipping and tracking for your return.</li>
                            <li>We reserve the right to refuse a return or exchange if the item does not meet the above conditions.</li>
                        </ul>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-indigo-50 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            For return or exchange requests, please contact:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><span className="font-medium">Email:</span> mahiracollection@gmail.com</p>
                            <p><span className="font-medium">Phone:</span> 01319235378</p>
                            <p><span className="font-medium">Business Address:</span> Cox's bazar main city</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetrunAnd;