import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Define the shape of the items passed in props
interface Item {
    id: string | number;
    name: string;
    collection: string;
}

// Define the shape of product of the day data to store
interface ProductOfTheDayItem {
    id: string;
    name: string;
    collection: string; // 'products' | 'comboProducts' | 'giftProducts'
}

interface ProductOfTheDayProps {
    allItems: Item[]; // Prop to accept the combined list
}

const ProductOfTheDay: React.FC<ProductOfTheDayProps> = ({ allItems }) => {
    // State to hold the selected product object
    const [selectedProduct, setSelectedProduct] = useState<ProductOfTheDayItem>({
        id: '',
        name: '',
        collection: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Debug logging for state changes
    useEffect(() => {
        console.log('🔧 ProductOfTheDay component - selectedProduct updated:', selectedProduct);
    }, [selectedProduct]);

    useEffect(() => {
        console.log('🔧 ProductOfTheDay component - allItems received:', allItems.length, 'items');
    }, [allItems]);

    // Fetch current product of the day on component mount
    useEffect(() => {
        fetchProductOfTheDay();
    }, []);

    const fetchProductOfTheDay = async () => {
        setLoading(true);
        try {
            console.log('🔄 Fetching product of the day from Firebase...');
            const productDoc = await getDoc(doc(db, 'productoftheday', 'product'));
            if (productDoc.exists()) {
                const data = productDoc.data();
                console.log('✅ Product of the day found in Firebase:', data);
                const product = data.product || { id: '', name: '', collection: '' };
                console.log('📦 Setting selected product to:', product);
                setSelectedProduct(product);
            } else {
                console.log('⚠️ No product of the day document found in Firebase - creating empty state');
                setSelectedProduct({ id: '', name: '', collection: '' });
            }
        } catch (error) {
            console.error('❌ Error fetching product of the day from Firebase:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error loading product of the day from database: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (productName: string) => {
        console.log('🔄 Product of the day changed to:', productName);
        
        if (productName === '') {
            // If empty selection, clear the product
            setSelectedProduct({ id: '', name: '', collection: '' });
        } else {
            // Find the selected product in allItems
            const selected = allItems.find(item => item.name === productName);
            if (selected) {
                const newProduct = {
                    id: String(selected.id),
                    name: selected.name,
                    collection: selected.collection
                };
                setSelectedProduct(newProduct);
                console.log(`📦 Product "${productName}" from collection: ${selected.collection} with ID: ${selected.id}`);
            }
        }
        
        console.log('🔄 Updated selectedProduct:', selectedProduct);
    };

    const handleSubmit = async () => {
        if (!selectedProduct.name) {
            alert('Please select a product.');
            return;
        }
        
        setSaving(true);
        try {
            console.log('💾 Starting save operation...');
            console.log('📦 Data to save:', selectedProduct);
            console.log('🔗 Firebase DB instance:', !!db);
            
            const dataToSave = {
                product: selectedProduct,
                updatedAt: new Date()
            };
            console.log('📄 Complete data object:', dataToSave);
            
            // Save product of the day to Firestore
            const docRef = doc(db, 'productoftheday', 'product');
            console.log('📍 Document reference:', docRef.path);
            
            await setDoc(docRef, dataToSave);
            
            console.log('✅ Product of the day saved successfully to Firebase');
            alert(`Product of the Day set to: ${selectedProduct.name}`);
            
            // Refresh the data to confirm it was saved
            console.log('🔄 Refreshing data from Firebase...');
            await fetchProductOfTheDay();
        } catch (error) {
            console.error('❌ Error saving product of the day to Firebase:', error);
            console.error('❌ Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error saving product of the day to database: ' + errorMessage);
        } finally {
            setSaving(false);
        }
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
                        value={selectedProduct.name}
                        onChange={(e) => handleSelectionChange(e.target.value)}
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
                        disabled={saving}
                        className="px-8 py-3 mt-4 text-white font-semibold rounded-md transition disabled:opacity-50"
                        style={{ backgroundColor: '#703102' }}
                    >
                        {saving ? 'SAVING...' : 'SUBMIT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductOfTheDay;