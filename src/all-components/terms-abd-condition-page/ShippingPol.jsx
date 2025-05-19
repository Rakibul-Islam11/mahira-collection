const ShippingPol = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
                <p className="text-gray-500">Effective Date: <span className="font-medium text-indigo-600">19-05-2025</span></p>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <p className="text-gray-700">
                    At Mahira Collection, we are committed to delivering your orders promptly and securely.
                    Please read our shipping policy to understand how we process and deliver your purchases.
                </p>
            </div>

            {/* Policy Sections */}
            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                            Delivery Coverage
                        </h2>
                        <p className="text-gray-600">
                            We currently deliver to all major cities and regions across Bangladesh.
                            For remote areas, delivery availability may vary depending on the courier service.
                        </p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                            Order Processing Time
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Orders are processed within 1–2 business days after payment confirmation.</li>
                            <li>Pre-order (free water) items may take 7–15 business days depending on supplier shipment from China.</li>
                            <li>You will receive a confirmation message once your order is shipped.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                            Delivery Time
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><span className="font-medium">Ready Stock Items:</span> Delivered within 2–5 business days after dispatch.</li>
                            <li><span className="font-medium">Pre-order Items:</span> Delivered within 30–45 business days, depending on customs and courier delays.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 4 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                            Shipping Charges
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Shipping fees vary based on your location and order weight.</li>
                            <li>Exact shipping cost will be displayed at checkout before final confirmation.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 5 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">5</span>
                            Courier Partners
                        </h2>
                        <p className="text-gray-600">
                            We work with reliable and reputed delivery partners to ensure your product reaches you safely and on time.
                        </p>
                    </div>
                </div>

                {/* Section 6 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">6</span>
                            Tracking Your Order
                        </h2>
                        <p className="text-gray-600">
                            Once your order is shipped, you will receive a tracking number via SMS or email to monitor your shipment's progress.
                        </p>
                    </div>
                </div>

                {/* Section 7 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">7</span>
                            Delivery Issues
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Please ensure correct delivery information is provided. We are not responsible for delays or failed deliveries due to incorrect address or contact information.</li>
                            <li>If your package is delayed or lost, please contact us immediately so we can assist with follow-up.</li>
                        </ul>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-indigo-50 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us for Shipping Queries</h2>
                        <div className="space-y-2 text-gray-700">
                            <p><span className="font-medium">Email:</span> mahiracollection@gmail.com</p>
                            <p><span className="font-medium">Phone:</span> 01319235378</p>
                            <p><span className="font-medium">Business Address:</span> mahiracollection</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPol;