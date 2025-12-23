import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Product, ProductFaq } from '../Dashboard'; 
import { 
    uploadImageToCloudinary, 
    uploadMultipleImagesToCloudinary, 
    validateImageFile 
} from '../../firebase/imageService';

interface AddProductProps {
    onSaveProduct: (productData: Omit<Product, 'id' | 'status' | 'firestoreId'>) => void;
    productToEdit: Product | null;
}

const AddProduct: React.FC<AddProductProps> = ({ onSaveProduct, productToEdit }) => {
    const initialFormState = useMemo(() => ({
        productName: '',
        category: '',
        size: '', 
        shortDescription: '',
        rating: '',
        longDescription: '',
        actualMRP: 0,
        sellingMRP: 0,
        discount: 0,
        ingredients: '',
        benefits: '',
        storageInfo: ''
    }), []);

    // --- STATE MANAGEMENT ---
    const [formState, setFormState] = useState(initialFormState);
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [otherImages, setOtherImages] = useState<File[]>([]);
    const [removedExistingOtherImages, setRemovedExistingOtherImages] = useState<boolean[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mainImageRemoved, setMainImageRemoved] = useState(false);
    
    const [faqs, setFaqs] = useState<ProductFaq[]>([]);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [newFaq, setNewFaq] = useState<Omit<ProductFaq, 'id'>>({ question: '', answer: '' });
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);
    const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const otherImagesInputRef = useRef<HTMLInputElement>(null);

    // --- PRICING LOGIC FIX ---
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        if (id === 'actualMRP' || id === 'discount') {
            const val = parseFloat(value) || 0;
            
            setFormState(prev => {
                const updated = { ...prev, [id]: val };
                const actual = id === 'actualMRP' ? val : updated.actualMRP;
                const discount = id === 'discount' ? val : updated.discount;
                
                // Calculate selling price: Selling = Actual - (Actual * Discount / 100)
                // We use Math.floor or Math.round only if you want whole numbers, 
                // but usually, precision is better here.
                let sellingMRP = actual;
                if (actual > 0 && discount > 0) {
                    sellingMRP = Number((actual - (actual * discount) / 100).toFixed(2));
                }

                return { ...updated, sellingMRP };
            });
        } else {
            setFormState(prev => ({...prev, [id]: value}));
        }
    };
    
    const handleReset = useCallback(() => {
        setFormState(initialFormState);
        setMainImage(null);
        setOtherImages([]);
        setFaqs([
            { id: Date.now() + 3, question: 'What is the shelf life of the oil?', answer: 'The shelf life is approximately 12 months.' },
            { id: Date.now() + 4, question: 'Is this oil cold-pressed?', answer: 'Yes, our oil is 100% cold-pressed.'}
        ]);
        setRemovedExistingOtherImages([]);
        setMainImageRemoved(false);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (otherImagesInputRef.current) otherImagesInputRef.current.value = '';
    }, [initialFormState]);

    useEffect(() => {
        if (productToEdit) {
            // Calculate existing discount percentage if not provided by DB
            const existingDiscount = productToEdit.actualMRP > 0 
                ? Math.round(((productToEdit.actualMRP - productToEdit.sellingMRP) / productToEdit.actualMRP) * 100) 
                : 0;

            setFormState({
                productName: productToEdit.productName || '',
                category: productToEdit.category || '',
                size: productToEdit.size || '',
                shortDescription: productToEdit.shortDescription || '',
                rating: productToEdit.rating || '',
                longDescription: productToEdit.longDescription || '',
                actualMRP: productToEdit.actualMRP || 0,
                sellingMRP: productToEdit.sellingMRP || 0,
                discount: existingDiscount, 
                ingredients: productToEdit.ingredients || '',
                benefits: productToEdit.benefits || '',
                storageInfo: productToEdit.storageInfo || ''
            });
            
            if (productToEdit.productFaqs && productToEdit.productFaqs.length > 0) {
                setFaqs(productToEdit.productFaqs);
            }
            setRemovedExistingOtherImages(productToEdit.otherImages ? new Array(productToEdit.otherImages.length).fill(false) : []);
            setMainImageRemoved(false);
        } else {
            handleReset();
        }
    }, [productToEdit, handleReset]);

    const handleSave = async () => {
        if (!formState.productName || !formState.category || !formState.size || formState.sellingMRP <= 0) {
            alert('Please fill out Product Name, Category, Size, and Pricing.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            let mainImageUrl = productToEdit?.mainImage && !mainImageRemoved ? productToEdit.mainImage : '';
            let otherImageUrls: string[] = productToEdit?.otherImages?.filter((_, idx) => !removedExistingOtherImages[idx]) || [];

            if (mainImage) {
                const validation = validateImageFile(mainImage);
                if (!validation.isValid) { alert(validation.error); return; }
                setUploadProgress(20);
                mainImageUrl = await uploadImageToCloudinary(mainImage, 'dev-admin/products/main');
                setUploadProgress(50);
            }

            if (otherImages.length > 0) {
                const newOtherImageUrls = await uploadMultipleImagesToCloudinary(otherImages, 'dev-admin/products/gallery');
                otherImageUrls = [...otherImageUrls, ...newOtherImageUrls];
                setUploadProgress(90);
            }

            const productData: Omit<Product, 'id' | 'status' | 'firestoreId'> = {
                productName: formState.productName,
                category: formState.category,
                size: formState.size,
                shortDescription: formState.shortDescription,
                rating: formState.rating,
                longDescription: formState.longDescription,
                actualMRP: Number(formState.actualMRP),
                sellingMRP: Number(formState.sellingMRP),
                mainImage: mainImageUrl,
                otherImages: otherImageUrls,
                ingredients: formState.ingredients,
                benefits: formState.benefits,
                storageInfo: formState.storageInfo,
                productFaqs: faqs
            };
            
            setUploadProgress(100);
            onSaveProduct(productData);
            alert(productToEdit ? 'Product updated successfully!' : 'Product added successfully!');
            if (!productToEdit) handleReset();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // --- HELPER HANDLERS ---
    const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && validateImageFile(file).isValid) setMainImage(file);
    };
    
    const handleOtherImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files).filter(f => validateImageFile(f).isValid);
            if ((otherImages.length + newFiles.length) > 5) {
                alert("Max 5 images allowed");
                return;
            }
            setOtherImages(prev => [...prev, ...newFiles]);
        }
    };

    const handleSaveFaq = () => {
        if (!newFaq.question || !newFaq.answer) return;
        if (editingFaqId) {
            setFaqs(prev => prev.map(f => f.id === editingFaqId ? { ...newFaq, id: editingFaqId } : f));
        } else {
            setFaqs(prev => [...prev, { ...newFaq, id: Date.now() }]);
        }
        closeFaqModal();
    };

    const toggleFaq = (id: number) => setOpenFaqId(prev => (prev === id ? null : id));
    const closeFaqModal = () => { setIsFaqModalOpen(false); setEditingFaqId(null); setNewFaq({ question: '', answer: '' }); };

    return (
        <div className="bg-gray-50 p-6 sm:p-0 font-sans">
            <div className="space-y-6">
                {/* Section 1: Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">{productToEdit ? 'Edit Product' : 'Add Product'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                            <input type="text" id="productName" value={formState.productName} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                            <select id="category" value={formState.category} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md">
                                <option value="">Select Category</option>
                                <option value="Groundnut Oil">Groundnut Oil</option>
                                <option value="Mustard Oil">Mustard Oil</option>
                                <option value="Safflower Oil">Safflower Oil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Bottle Size</label>
                            <select id="size" value={formState.size} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md">
                                <option value="">Select Size</option>
                                <option value="100 ml">100 ml</option>
                                <option value="500 ml">500 ml</option>
                                <option value="1 L">1 L</option>
                                <option value="5 L">5 L</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Rating</label>
                            <select id="rating" value={formState.rating} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md">
                                <option value="">Select rating</option>
                                <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Images */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={() => mainImageInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center cursor-pointer">
                            <input type="file" ref={mainImageInputRef} onChange={handleMainImageChange} className="hidden" accept="image/*" />
                            {mainImage ? (
                                <img src={URL.createObjectURL(mainImage)} alt="Preview" className="max-h-full object-contain" />
                            ) : productToEdit?.mainImage && !mainImageRemoved ? (
                                <img src={productToEdit.mainImage} alt="Current" className="max-h-full object-contain" />
                            ) : <p>Upload Main Image</p>}
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 overflow-y-auto">
                           <input type="file" ref={otherImagesInputRef} onChange={handleOtherImagesChange} className="hidden" multiple accept="image/*" />
                           <button onClick={() => otherImagesInputRef.current?.click()} className="text-blue-600 text-sm mb-2"> + Add Gallery Images</button>
                           <div className="grid grid-cols-3 gap-2">
                               {otherImages.map((f, i) => (
                                   <div key={i} className="h-16 bg-gray-100 rounded flex items-center justify-center text-xs">New Image {i+1}</div>
                               ))}
                           </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Pricing */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Actual MRP</label>
                            <input type="number" id="actualMRP" value={formState.actualMRP || ''} onChange={handleFormChange} className="w-full p-2 border-2 border-[#703102] rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Discount %</label>
                            <input type="number" id="discount" value={formState.discount || ''} onChange={handleFormChange} className="w-full p-2 border-2 border-[#703102] rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Selling MRP (Auto)</label>
                            <input type="number" id="sellingMRP" value={formState.sellingMRP || ''} disabled className="w-full p-2 border-2 border-gray-300 bg-gray-50 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Section 4: Actions */}
                <div className="flex space-x-4">
                    <button onClick={handleSave} disabled={isUploading} className="px-8 py-3 bg-[#703102] text-white rounded-lg font-bold disabled:opacity-50">
                        {isUploading ? `Uploading ${uploadProgress}%` : productToEdit ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
                    </button>
                    <button onClick={handleReset} className="px-8 py-3 border-2 border-[#703102] text-[#703102] rounded-lg font-bold">RESET</button>
                </div>
            </div>

            {/* FAQ Modal Logic remains same as your original snippet */}
            {isFaqModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Add FAQ</h3>
                        <textarea name="question" placeholder="Question" className="w-full p-2 border mb-2" onChange={(e) => setNewFaq(p => ({...p, question: e.target.value}))}></textarea>
                        <textarea name="answer" placeholder="Answer" className="w-full p-2 border mb-4" onChange={(e) => setNewFaq(p => ({...p, answer: e.target.value}))}></textarea>
                        <div className="flex justify-end gap-2">
                            <button onClick={closeFaqModal}>Cancel</button>
                            <button onClick={handleSaveFaq} className="bg-[#703102] text-white px-4 py-1 rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProduct;