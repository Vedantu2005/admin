import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Define the shape of the items passed in props
interface Item {
    id: string | number;
    name: string;
    collection: string;
}

// Define the shape of bestseller data to store
interface BestSellerItem {
    id: string;
    name: string;
    collection: string; // 'products' | 'comboProducts' | 'giftProducts'
}

interface BestSellerProps {
    allItems: Item[]; // Update prop to accept the combined list
}

const BestSeller: React.FC<BestSellerProps> = ({ allItems }) => {
    const [selectedSellers, setSelectedSellers] = useState<BestSellerItem[]>([
        { id: '', name: '', collection: '' },
        { id: '', name: '', collection: '' },
        { id: '', name: '', collection: '' },
        { id: '', name: '', collection: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Debug logging for state changes
    useEffect(() => {
        console.log('🔧 BestSeller component - selectedSellers updated:', selectedSellers);
    }, [selectedSellers]);

    useEffect(() => {
        console.log('🔧 BestSeller component - allItems received:', allItems.length, 'items');
    }, [allItems]);

    // Fetch current bestsellers on component mount
    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        setLoading(true);
        try {
            console.log('🔄 Fetching bestsellers from Firebase...');
            const bestSellerDoc = await getDoc(doc(db, 'bestsellers', 'products'));
            if (bestSellerDoc.exists()) {
                const data = bestSellerDoc.data();
                console.log('✅ Bestsellers found in Firebase:', data);
                const products = data.products || [
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' }
                ];
                console.log('📦 Setting selected sellers to:', products);
                setSelectedSellers(products);
            } else {
                console.log('⚠️ No bestsellers document found in Firebase - creating empty state');
                setSelectedSellers([
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' },
                    { id: '', name: '', collection: '' }
                ]);
            }
        } catch (error) {
            console.error('❌ Error fetching bestsellers from Firebase:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error loading bestsellers from database: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (index: number, productName: string) => {
        console.log(`🔄 Dropdown ${index + 1} changed to:`, productName);
        const updatedSellers = [...selectedSellers];
        
        if (productName === '') {
            // If empty selection, clear the item
            updatedSellers[index] = { id: '', name: '', collection: '' };
        } else {
            // Find the selected product in allItems
            const selectedProduct = allItems.find(item => item.name === productName);
            if (selectedProduct) {
                updatedSellers[index] = {
                    id: String(selectedProduct.id),
                    name: selectedProduct.name,
                    collection: selectedProduct.collection
                };
                console.log(`📦 Product "${productName}" from collection: ${selectedProduct.collection} with ID: ${selectedProduct.id}`);
            }
        }
        
        setSelectedSellers(updatedSellers);
        console.log('🔄 Updated selectedSellers:', updatedSellers);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            console.log('💾 Starting save operation...');
            console.log('📦 Data to save:', selectedSellers);
            console.log('🔗 Firebase DB instance:', !!db);
            
            const dataToSave = {
                products: selectedSellers,
                updatedAt: new Date()
            };
            console.log('📄 Complete data object:', dataToSave);
            
            // Save bestsellers to Firestore
            const docRef = doc(db, 'bestsellers', 'products');
            console.log('📍 Document reference:', docRef.path);
            
            await setDoc(docRef, dataToSave);
            
            console.log('✅ Bestsellers saved successfully to Firebase');
            alert('Best sellers updated successfully!');
            
            // Refresh the data to confirm it was saved
            console.log('🔄 Refreshing data from Firebase...');
            await fetchBestSellers();
        } catch (error) {
            console.error('❌ Error saving bestsellers to Firebase:', error);
            console.error('❌ Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error saving bestsellers to database: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm font-sans">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Best Seller</h1>
            </div>
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
                            value={selectedSellers[index].name}
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
                        disabled={saving}
                        className="px-8 py-3 mt-4 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#703102' }}
                    >
                        {saving ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                SAVING...
                            </div>
                        ) : (
                            'SUBMIT'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BestSeller;