import React, { useState } from 'react';

// Define the shape of the items passed in props
interface Item {
    id: string | number;
    name: string;
}

interface ProductOfTheDayProps {
    allItems: Item[]; // Prop to accept the combined list
}

const ProductOfTheDay: React.FC<ProductOfTheDayProps> = ({ allItems }) => {
    // State to hold the selected product name
    const [selectedProduct, setSelectedProduct] = useState<string>('');

    const handleSubmit = () => {
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        // Handle the submission logic here, e.g., send to an API
        console.log("Selected Product of the Day:", selectedProduct);
        alert(`Product of the Day set to: ${selectedProduct}`);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Product of the day</h1>
            <div className="space-y-6 max-w-lg">
                <div>
                    <label 
                        htmlFor="product-of-the-day"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Select Product of the Day 
                    </label>
                    <select
                        id="product-of-the-day"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full p-3 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]"
                    >
                        <option value="">Select a Product</option>
                        {/* Map over the combined 'allItems' list */}
                        {allItems.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 mt-4 text-white font-semibold rounded-md transition"
                        style={{ backgroundColor: '#703102' }}
                    >
                        SUBMIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductOfTheDay;