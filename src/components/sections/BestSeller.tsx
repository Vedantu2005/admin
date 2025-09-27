import React, { useState } from 'react';

// Define the shape of the items passed in props
interface Item {
    id: string | number;
    name: string;
}

interface BestSellerProps {
    allItems: Item[]; // Update prop to accept the combined list
}

const BestSeller: React.FC<BestSellerProps> = ({ allItems }) => {
    const [selectedSellers, setSelectedSellers] = useState<string[]>(['', '', '', '']);

    const handleSelectionChange = (index: number, productName: string) => {
        const updatedSellers = [...selectedSellers];
        updatedSellers[index] = productName;
        setSelectedSellers(updatedSellers);
    };

    const handleSubmit = () => {
        console.log("Selected Best Sellers:", selectedSellers);
        alert(`Selected Products: \n1: ${selectedSellers[0] || 'None'}\n2: ${selectedSellers[1] || 'None'}\n3: ${selectedSellers[2] || 'None'}\n4: ${selectedSellers[3] || 'None'}`);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Best Seller</h1>
            <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                        <label 
                            htmlFor={`best-seller-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Select Best seller (0{index + 1})
                        </label>
                        <select
                            id={`best-seller-${index}`}
                            value={selectedSellers[index]}
                            onChange={(e) => handleSelectionChange(index, e.target.value)}
                            className="w-full p-3 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]"
                        >
                            <option value="">Select a Product</option>
                            {/* ✅ Map over the combined 'allItems' list */}
                            {allItems.map((item) => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
                
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

export default BestSeller;