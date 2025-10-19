import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { GiftProduct } from '../Dashboard';
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary, validateImageFile } from '../../firebase/imageService';

interface AddGiftProps {
    onSaveProduct: (productData: Omit<GiftProduct, 'id' | 'status'>, id: number | null) => void;
    productToEdit: GiftProduct | null;
}

interface ProductFaq {
  id: number;
  question: string;
  answer: string;
}

const AddGift: React.FC<AddGiftProps> = ({ onSaveProduct, productToEdit }) => {
    const initialFormState = useMemo(() => ({
        productName: '',
        category: '',
        mrp: 0,
        discount: 0,
        sellingMRP: 0,
        contents: '',
        description: '',
    }), []);

    const [formState, setFormState] = useState(initialFormState);
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [otherImages, setOtherImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [imageRemoved, setImageRemoved] = useState(false);
    const [otherImagesRemoved, setOtherImagesRemoved] = useState<boolean[]>([]);
    const [faqs, setFaqs] = useState<ProductFaq[]>([
        { id: Date.now() + 1, question: 'Is gift wrapping available?', answer: 'Yes, all our gift products come with premium gift wrapping.' },
        { id: Date.now() + 2, question: 'Can I add a custom message?', answer: 'Yes, you can add a custom message at the checkout page.'}
    ]);
    
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [newFaq, setNewFaq] = useState<Omit<ProductFaq, 'id'>>({ question: '', answer: '' });
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);
    const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const otherImagesInputRef = useRef<HTMLInputElement>(null);

    const handleReset = useCallback(() => {
        setFormState(initialFormState);
        setMainImage(null);
        setOtherImages([]);
        setImageRemoved(false);
        setOtherImagesRemoved([]);
        setFaqs([
            { id: Date.now() + 1, question: 'Is gift wrapping available?', answer: 'Yes, all our gift products come with premium gift wrapping.' },
            { id: Date.now() + 2, question: 'Can I add a custom message?', answer: 'Yes, you can add a custom message at the checkout page.'}
        ]);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (otherImagesInputRef.current) otherImagesInputRef.current.value = '';
    }, [initialFormState]);

    useEffect(() => {
        if (productToEdit) {
            console.log('Edit mode - Loading product data:', {
                id: productToEdit.id,
                category: productToEdit.category,
                description: productToEdit.description,
                mainImage: productToEdit.image,
                otherImagesCount: productToEdit.otherImages?.length || 0,
                otherImages: productToEdit.otherImages,
                faqsCount: productToEdit.productFaqs?.length || 0,
                faqs: productToEdit.productFaqs
            });
            
            setFormState({
                productName: productToEdit.category,
                category: productToEdit.category,
                mrp: productToEdit.mrp,
                discount: 0,
                sellingMRP: productToEdit.mrp,
                contents: productToEdit.contents,
                description: productToEdit.description || '',
            });
            setImageRemoved(false);
            setOtherImagesRemoved(productToEdit.otherImages ? new Array(productToEdit.otherImages.length).fill(false) : []);
            
            // Load existing FAQs or use default ones
            if (productToEdit.productFaqs && productToEdit.productFaqs.length > 0) {
                setFaqs(productToEdit.productFaqs);
            } else {
                // Set default FAQs for new products
                setFaqs([
                    { id: Date.now() + 1, question: 'Is gift wrapping available?', answer: 'Yes, all our gift products come with premium gift wrapping.' },
                    { id: Date.now() + 2, question: 'Can I add a custom message?', answer: 'Yes, you can add a custom message at the checkout page.'}
                ]);
            }
        } else {
            handleReset();
        }
    }, [productToEdit, handleReset]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id === 'mrp' || id === 'discount') {
            setFormState(prev => {
                const updated = {
                    ...prev,
                    [id]: parseFloat(value) || 0
                };
                const mrp = id === 'mrp' ? parseFloat(value) || 0 : updated.mrp;
                const discount = id === 'discount' ? parseFloat(value) || 0 : updated.discount;
                let sellingMRP = mrp;
                if (mrp > 0 && discount > 0) {
                    sellingMRP = Math.round(mrp - (mrp * discount) / 100);
                }
                return {
                    ...updated,
                    sellingMRP
                };
            });
        } else {
            setFormState(prev => ({...prev, [id]: value }));
        }
    };
    
    const handleSave = async () => {
        if (!formState.productName || !formState.category || formState.mrp <= 0) {
            alert('Please fill out Product Name, Category, and MRP.');
            return;
        }
        
        setUploading(true);
        
        try {
            let imageUrl = 'https://via.placeholder.com/40'; // Default fallback
            let otherImageUrls: string[] = [];
            
            // If there's a new image selected, upload to Cloudinary
            if (mainImage) {
                // Validate the image file
                const validation = validateImageFile(mainImage);
                if (!validation.isValid) {
                    alert(`Image error: ${validation.error}`);
                    setUploading(false);
                    return;
                }
                
                // Upload to Cloudinary
                imageUrl = await uploadImageToCloudinary(mainImage, 'dev-admin/gifts');
            } else if (productToEdit?.image && !imageRemoved) {
                // Keep the existing image if not removed
                imageUrl = productToEdit.image;
            }
            
            // Handle other images
            if (otherImages.length > 0) {
                // Validate all other images
                for (const file of otherImages) {
                    const validation = validateImageFile(file);
                    if (!validation.isValid) {
                        alert(`Image error: ${validation.error}`);
                        setUploading(false);
                        return;
                    }
                }
                
                // Upload all other images to Cloudinary
                otherImageUrls = await uploadMultipleImagesToCloudinary(otherImages, 'dev-admin/gifts');
            }
            
            // Keep existing other images that weren't removed
            if (productToEdit?.otherImages) {
                const existingImages = productToEdit.otherImages.filter((_, index) => 
                    !otherImagesRemoved[index]
                );
                otherImageUrls = [...existingImages, ...otherImageUrls];
            }
            
            const productData = {
                image: imageUrl,
                category: formState.productName,
                mrp: formState.mrp,
                discount: formState.discount,
                sellingMRP: formState.sellingMRP,
                contents: formState.contents,
                description: formState.description,
                otherImages: otherImageUrls.length > 0 ? otherImageUrls : undefined,
                productFaqs: faqs.length > 0 ? faqs : undefined,
            };
            
            console.log('Saving gift product with FAQs:', {
                faqsCount: faqs.length,
                faqs: faqs,
                productData: productData
            });
            
            onSaveProduct(productData, productToEdit ? productToEdit.id : null);
            alert(productToEdit ? 'Gifting Product updated!' : 'Gifting Product added!');
            
        } catch (error) {
            console.error('Error saving gift product:', error);
            alert('Failed to save gift product. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setMainImage(file);
    };

    const handleOtherImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            if (fileArray.length > 5) {
                alert('You can upload maximum 5 images');
                return;
            }
            setOtherImages(fileArray);
        }
    };

    const removeOtherImage = (index: number) => {
        setOtherImages(prev => {
            const newImages = [...prev];
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const removeExistingOtherImage = (index: number) => {
        setOtherImagesRemoved(prev => {
            const newRemoved = [...prev];
            newRemoved[index] = true;
            return newRemoved;
        });
    };

    const handleNewFaqChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewFaq(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveFaq = () => {
        if (!newFaq.question || !newFaq.answer) {
            alert('Please provide both a question and an answer.'); return;
        }
        if (editingFaqId) {
            setFaqs(prev => prev.map(f => f.id === editingFaqId ? { ...newFaq, id: editingFaqId } : f));
        } else {
            setFaqs(prev => [...prev, { ...newFaq, id: Date.now() }]);
        }
        closeFaqModal();
    };
    const handleEditFaq = (faq: ProductFaq) => {
        setEditingFaqId(faq.id); setNewFaq({ question: faq.question, answer: faq.answer }); setIsFaqModalOpen(true);
    };
    const handleDeleteFaq = (id: number) => {
        if (window.confirm('Are you sure?')) setFaqs(prev => prev.filter(f => f.id !== id));
    };
    const toggleFaq = (id: number) => {
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };
    const openFaqModal = () => setIsFaqModalOpen(true);
    const closeFaqModal = () => {
        setIsFaqModalOpen(false); setEditingFaqId(null); setNewFaq({ question: '', answer: '' });
    };
  
    return (
    <div className="bg-gray-50 p-6 sm:p-0 font-sans">
      <div className="space-y-6">
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{productToEdit ? 'Edit Gifting Product' : 'Add Gifting Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-600 mb-1">Gifting Product Name</label>
              <input type="text" id="productName" value={formState.productName} onChange={handleFormChange} placeholder="e.g., Diwali Hamper" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select id="category" value={formState.category} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]">
                <option value="">Select a category</option>
                <option value="Festival Gifts">Festival Gifts</option>
                <option value="Corporate Gifts">Corporate Gifts</option>
                <option value="Wellness Box">Wellness Box</option>
              </select>
            </div>
             <div className="md:col-span-1">
              <label htmlFor="mrp" className="block text-sm font-medium text-gray-600 mb-1">MRP*</label>
              <input type="number" id="mrp" value={formState.mrp > 0 ? formState.mrp : ''} onChange={handleFormChange} placeholder="e.g., 999" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="discount" className="block text-sm font-medium text-gray-600 mb-1">Discount in %</label>
              <input type="number" id="discount" value={formState.discount > 0 ? formState.discount : ''} onChange={handleFormChange} placeholder="e.g., 10" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]" />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="sellingMRP" className="block text-sm font-medium text-gray-600 mb-1">Selling MRP*</label>
              <input type="number" id="sellingMRP" value={formState.sellingMRP > 0 ? formState.sellingMRP : ''} disabled placeholder="Auto-calculated" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102] bg-gray-100 cursor-not-allowed" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contents" className="block text-sm font-medium text-gray-600 mb-1">Contents</label>
              <textarea id="contents" value={formState.contents} onChange={handleFormChange} rows={3} placeholder="List items included in the gift pack" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]"></textarea>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Product Description</label>
              <textarea id="description" value={formState.description} onChange={handleFormChange} rows={4} placeholder="Detailed product description, benefits, and features" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]"></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Product Image</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Main Image
                <span className="block text-xs text-blue-600 mt-1">
                  Recommended: <span className="font-semibold">800×800 px, square, under 2MB</span>
                </span>
                {productToEdit?.image && !mainImage && !imageRemoved && (
                  <span className="text-xs text-blue-600 ml-2">(Current image shown - click to change)</span>
                )}
                {imageRemoved && (
                  <span className="text-xs text-orange-600 ml-2">(Image removed - click to upload new)</span>
                )}
              </label>
              <input type="file" ref={mainImageInputRef} onChange={handleMainImageChange} className="hidden" accept="image/*" />
              <div onClick={() => mainImageInputRef.current?.click()} className="relative group border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center cursor-pointer hover:border-[#703102] transition-colors">
                {mainImage ? (
                  <img src={URL.createObjectURL(mainImage)} alt="Main preview" className="max-h-full max-w-full object-contain" />
                ) : productToEdit?.image && !imageRemoved ? (
                  <img src={productToEdit.image} alt="Current product image" className="max-h-full max-w-full object-contain" />
                ) : (
                  <p className="text-gray-400 text-center">Click to upload main image</p>
                )}
                {(mainImage || (productToEdit?.image && !imageRemoved)) && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setMainImage(null);
                      setImageRemoved(true);
                      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
                    }} 
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" 
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Additional Product Images (up to 5)</h2>
          
          {/* Single upload block for multiple images */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Upload Multiple Images
                <span className="block text-xs text-blue-600 mt-1">
                  Recommended: <span className="font-semibold">800×800 px, square, under 2MB</span>
                </span>
              </label>
              <input 
                type="file" 
                ref={otherImagesInputRef}
                onChange={handleOtherImagesChange} 
                className="hidden" 
                accept="image/*" 
                multiple
              />
              <div 
                onClick={() => otherImagesInputRef.current?.click()} 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#703102] transition-colors"
              >
                <div className="space-y-2">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-500">Click to upload additional images</p>
                  <p className="text-sm text-gray-400">Maximum 5 images allowed</p>
                </div>
              </div>
            </div>

            {/* Display existing images from productToEdit */}
            {productToEdit?.otherImages && productToEdit.otherImages.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-800 mb-3">
                  📁 Current Images ({productToEdit.otherImages.filter((_, index) => !otherImagesRemoved[index]).length})
                  <span className="text-xs text-blue-600 ml-2">Click ✕ to remove</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {productToEdit.otherImages.map((imageUrl, index) => 
                    !otherImagesRemoved[index] ? (
                      <div key={index} className="relative group border-2 border-blue-300 rounded-lg overflow-hidden">
                        <img src={imageUrl} alt={`Current image ${index + 1}`} className="w-full h-24 object-cover" />
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                        <button 
                          onClick={() => removeExistingOtherImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs" 
                          aria-label={`Remove current image ${index + 1}`}
                        >
                          ✕
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Display newly selected images */}
            {otherImages.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-800 mb-3">
                  📎 Selected Images ({otherImages.length}/5)
                  <span className="text-xs text-green-600 ml-2">Ready to upload</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {otherImages.map((file, index) => (
                    <div key={index} className="relative group border-2 border-green-300 rounded-lg overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover" />
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        New {index + 1}
                      </div>
                      <button 
                        onClick={() => removeOtherImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs" 
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Faqs</h2>
          <div className="space-y-2 mb-6">
            {faqs.map(faq => (
              <div key={faq.id} className="relative group border-b border-gray-200 py-2">
                <button onClick={() => toggleFaq(faq.id)} className="w-full flex justify-between items-center text-left text-gray-800">
                  <span className="font-semibold pr-16">{faq.question}</span>
                  <div className="flex items-center absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="flex items-center space-x-2 mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={(e) => { e.stopPropagation(); handleEditFaq(faq); }} className="p-1.5 bg-gray-100 rounded-full hover:bg-amber-100 text-gray-600 hover:text-amber-600" aria-label="Edit FAQ"><Pencil size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFaq(faq.id); }} className="p-1.5 bg-gray-100 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600" aria-label="Delete FAQ"><Trash2 size={12} /></button>
                    </div>
                    <span className="text-xl font-light">{openFaqId === faq.id ? '-' : '+'}</span>
                  </div>
                </button>
                {openFaqId === faq.id && (<div className="mt-2 pl-2 text-gray-600 text-sm">{faq.answer}</div>)}
              </div>
            ))}
          </div>
          <button onClick={openFaqModal} className="px-6 py-2 text-white font-semibold rounded-md transition" style={{ backgroundColor: '#703102' }}>ADD MORE</button>
        </div>
        
        <div className="flex justify-start space-x-4 mt-6">
            <button 
                onClick={handleSave} 
                disabled={uploading}
                className="px-6 py-2 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: '#703102' }}
            >
                {uploading ? 'Uploading...' : (productToEdit ? 'UPDATE GIFT PRODUCT' : 'ADD GIFT PRODUCT')}
            </button>
            <button 
                type="button" 
                onClick={handleReset} 
                disabled={uploading}
                className="px-6 py-2 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: '#703102' }}
            >
                RESET
            </button>
        </div>

        {isFaqModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
              <button onClick={closeFaqModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingFaqId ? 'Edit Faq' : 'Add Faq'}</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="faq-question" className="block text-md font-semibold text-gray-700 mb-2">Question</label>
                  <textarea id="faq-question" name="question" value={newFaq.question} onChange={handleNewFaqChange} placeholder="text area" rows={3} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
                </div>
                <div>
                  <label htmlFor="faq-answer" className="block text-md font-semibold text-gray-700 mb-2">Answer</label>
                  <textarea id="faq-answer" name="answer" value={newFaq.answer} onChange={handleNewFaqChange} placeholder="text area" rows={5} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button onClick={closeFaqModal} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md">Cancel</button>
                <button onClick={handleSaveFaq} className="px-6 py-2 text-white font-semibold rounded-md" style={{ backgroundColor: '#703102' }}>{editingFaqId ? 'Update Faq' : 'Add Faq'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGift;