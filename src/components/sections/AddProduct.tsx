import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Product, ProductVariant, ProductFaq } from '../Dashboard'; // Import from Dashboard
import { 
    uploadImageToCloudinary, 
    uploadMultipleImagesToCloudinary, 
    validateImageFile 
} from '../../firebase/imageService';

// --- Define props interface ---
interface AddProductProps {
    onSaveProduct: (productData: Omit<Product, 'id' | 'status' | 'firestoreId'>, id: number | null) => void;
    productToEdit: Product | null;
}

const AddProduct: React.FC<AddProductProps> = ({ onSaveProduct, productToEdit }) => {
    const initialFormState = useMemo(() => ({
        productName: '',
        category: '',
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
    
    // Default variants and FAQs are now set here
    const [variants, setVariants] = useState<ProductVariant[]>([
        { id: Date.now() + 1, bottleSize: '500 ml bottle', actualMRP: 280, sellingMRP: 240, discount: 14, pricePerLiter: 480 },
        { id: Date.now() + 2, bottleSize: '1 L bottle', actualMRP: 550, sellingMRP: 480, discount: 12, pricePerLiter: 480 },
    ]);
    const [faqs, setFaqs] = useState<ProductFaq[]>([
        { id: Date.now() + 3, question: 'What is the shelf life of the oil?', answer: 'The shelf life is approximately 12 months from the date of manufacturing. Please store it in a cool, dry place away from direct sunlight.' },
        { id: Date.now() + 4, question: 'Is this oil cold-pressed?', answer: 'Yes, our oil is 100% cold-pressed, ensuring that all the natural nutrients and flavors are retained.'}
    ]);
    
    // State for modals and editing
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [newVariant, setNewVariant] = useState<Omit<ProductVariant, 'id'>>({ bottleSize: '', actualMRP: 0, sellingMRP: 0, discount: 0, pricePerLiter: 0 });
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [newFaq, setNewFaq] = useState<Omit<ProductFaq, 'id'>>({ question: '', answer: '' });
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);
    const [editingFaqId, setEditingFaqId] = useState<number | null>(null);

    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const otherImagesInputRef = useRef<HTMLInputElement>(null);

    // --- FORM HANDLERS ---
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id === 'actualMRP' || id === 'discount') {
            setFormState(prev => {
                const updated = {
                    ...prev,
                    [id]: parseFloat(value) || 0
                };
                const actual = id === 'actualMRP' ? parseFloat(value) || 0 : updated.actualMRP;
                const discount = id === 'discount' ? parseFloat(value) || 0 : updated.discount;
                let sellingMRP = actual;
                if (actual > 0 && discount > 0) {
                    sellingMRP = Math.round(actual - (actual * discount) / 100);
                }
                return {
                    ...updated,
                    sellingMRP
                };
            });
        } else {
            setFormState(prev => ({...prev, [id]: value}));
        }
    };
    
    const handleReset = useCallback(() => {
        setFormState(initialFormState);
        setMainImage(null);
        setOtherImages([]);
        setVariants([
            { id: Date.now() + 1, bottleSize: '500 ml ', actualMRP: 280, sellingMRP: 240, discount: 14, pricePerLiter: 480 },
            { id: Date.now() + 2, bottleSize: '1 L ', actualMRP: 550, sellingMRP: 480, discount: 12, pricePerLiter: 480 },
        ]);
        setFaqs([
            { id: Date.now() + 3, question: 'What is the shelf life of the oil?', answer: 'The shelf life is approximately 12 months from the date of manufacturing.' },
            { id: Date.now() + 4, question: 'Is this oil cold-pressed?', answer: 'Yes, our oil is 100% cold-pressed.'}
        ]);
        setRemovedExistingOtherImages([]);
        setMainImageRemoved(false);
        if (mainImageInputRef.current) mainImageInputRef.current.value = '';
        if (otherImagesInputRef.current) otherImagesInputRef.current.value = '';
    }, [initialFormState]);

    // Effect to populate form when in "Edit" mode
    useEffect(() => {
        if (productToEdit) {
            setFormState({
                productName: productToEdit.productName || productToEdit.category || '',
                category: productToEdit.category || '',
                shortDescription: productToEdit.shortDescription || '',
                rating: productToEdit.rating || '',
                longDescription: productToEdit.longDescription || '',
                actualMRP: productToEdit.actualMRP || 0,
                sellingMRP: productToEdit.sellingMRP || 0,
                discount: 0, // Will be calculated
                ingredients: productToEdit.ingredients || '',
                benefits: productToEdit.benefits || '',
                storageInfo: productToEdit.storageInfo || ''
            });
            
            // Load existing variants or use defaults
            if (productToEdit.productVariants && productToEdit.productVariants.length > 0) {
                setVariants(productToEdit.productVariants);
            } else {
                setVariants([
                    { id: Date.now() + 1, bottleSize: '500 ml ', actualMRP: 280, sellingMRP: 240, discount: 14, pricePerLiter: 480 },
                    { id: Date.now() + 2, bottleSize: '1 L ', actualMRP: 550, sellingMRP: 480, discount: 12, pricePerLiter: 480 },
                ]);
            }
            
            // Load existing FAQs or use defaults
            if (productToEdit.productFaqs && productToEdit.productFaqs.length > 0) {
                setFaqs(productToEdit.productFaqs);
            } else {
                setFaqs([
                    { id: Date.now() + 3, question: 'What is the shelf life of the oil?', answer: 'The shelf life is approximately 12 months from the date of manufacturing. Please store it in a cool, dry place away from direct sunlight.' },
                    { id: Date.now() + 4, question: 'Is this oil cold-pressed?', answer: 'Yes, our oil is 100% cold-pressed, ensuring that all the natural nutrients and flavors are retained.'}
                ]);
            }
        } else {
            handleReset();
        }
    }, [productToEdit, handleReset]);
    
    const handleSave = async () => {
        if (!formState.productName || !formState.category || formState.sellingMRP <= 0) {
            alert('Please fill out Product Name, Category, and Selling MRP.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            let mainImageUrl = productToEdit?.mainImage && !mainImageRemoved ? productToEdit.mainImage : '';
            let otherImageUrls: string[] = productToEdit?.otherImages?.filter((_, idx) => !removedExistingOtherImages[idx]) || [];

            // Upload main image to Cloudinary if a new one is selected
            if (mainImage) {
                const validation = validateImageFile(mainImage);
                if (!validation.isValid) {
                    alert(validation.error);
                    return;
                }
                
                setUploadProgress(20);
                mainImageUrl = await uploadImageToCloudinary(mainImage, 'dev-admin/products/main');
                setUploadProgress(50);
            }

            // Upload other images to Cloudinary if new ones are selected
            if (otherImages.length > 0) {
                // Validate all other images
                for (const file of otherImages) {
                    const validation = validateImageFile(file);
                    if (!validation.isValid) {
                        alert(`Error with file ${file.name}: ${validation.error}`);
                        return;
                    }
                }

                const newOtherImageUrls = await uploadMultipleImagesToCloudinary(
                    otherImages, 
                    'dev-admin/products/gallery'
                );
                otherImageUrls = [...otherImageUrls, ...newOtherImageUrls];
                setUploadProgress(90);
            }

            const productData: Omit<Product, 'id' | 'status' | 'firestoreId'> = {
                // Basic product info
                productName: formState.productName,
                category: formState.category,
                shortDescription: formState.shortDescription,
                rating: formState.rating,
                longDescription: formState.longDescription,
                
                // Pricing (for backward compatibility)
                actualMRP: Number(formState.actualMRP),
                sellingMRP: Number(formState.sellingMRP),
                variants: variants.length,
                
                // Images - now using Cloudinary URLs
                mainImage: mainImageUrl,
                otherImages: otherImageUrls,
                
                // Product info
                ingredients: formState.ingredients,
                benefits: formState.benefits,
                storageInfo: formState.storageInfo,
                
                // Variants and FAQs
                productVariants: variants,
                productFaqs: faqs
            };
            
            setUploadProgress(100);
            onSaveProduct(productData, productToEdit ? productToEdit.id : null);
            alert(productToEdit ? 'Product updated successfully!' : 'Product added successfully!');
            
            // Reset form if it's a new product
            if (!productToEdit) {
                handleReset();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

  // --- IMAGE HANDLERS ---
  const handleMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        if (event.target) event.target.value = '';
        return;
      }
      setMainImage(file);
    }
  };
  
  const handleOtherImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Validate each file
      for (const file of newFiles) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(`Error with file ${file.name}: ${validation.error}`);
          if (event.target) event.target.value = '';
          return;
        }
      }
      
      // Check total count limit
      const totalCount = otherImages.length + newFiles.length;
      if (totalCount > 5) {
        alert(`You can only upload up to 5 additional images. You're trying to add ${newFiles.length} files, but you already have ${otherImages.length}.`);
        if (event.target) event.target.value = '';
        return;
      }
      
      setOtherImages(prev => [...prev, ...newFiles]);
      if (otherImagesInputRef.current) otherImagesInputRef.current.value = '';
    }
  };
  
  const removeOtherImage = (indexToRemove: number) => {
    setOtherImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingOtherImage = (index: number) => {
    setRemovedExistingOtherImages(prev => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
    });
  };

  // --- VARIANT HANDLERS ---
  const handleNewVariantChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'actualMRP' || name === 'discount') {
      // Update actualMRP or discount, then recalculate sellingMRP
      setNewVariant(prev => {
        const updated = {
          ...prev,
          [name]: parseFloat(value) || 0
        };
        // Calculate sellingMRP
        const actual = name === 'actualMRP' ? parseFloat(value) || 0 : updated.actualMRP;
        const discount = name === 'discount' ? parseFloat(value) || 0 : updated.discount;
        let sellingMRP = actual;
        if (actual > 0 && discount > 0) {
          sellingMRP = Math.round(actual - (actual * discount) / 100);
        }
        return {
          ...updated,
          sellingMRP
        };
      });
    } else {
      setNewVariant(prev => ({ ...prev, [name]: name === 'bottleSize' ? value : parseFloat(value) || 0 }));
    }
  };
  
  const handleSaveVariant = () => {
    if (!newVariant.bottleSize || newVariant.actualMRP <= 0 || newVariant.sellingMRP <= 0) {
      alert('Please fill all required fields for the variant.');
      return;
    }
    if (editingVariantId) {
      setVariants(prev => prev.map(v => v.id === editingVariantId ? { ...newVariant, id: editingVariantId } : v));
    } else {
      setVariants(prev => [...prev, { ...newVariant, id: Date.now() }]);
    }
    closeVariantModal();
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setNewVariant({
      bottleSize: variant.bottleSize,
      actualMRP: variant.actualMRP,
      sellingMRP: variant.sellingMRP,
      discount: variant.discount,
      pricePerLiter: variant.pricePerLiter,
    });
    setIsVariantModalOpen(true);
  };

  const handleDeleteVariant = (id: number) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const openVariantModal = () => setIsVariantModalOpen(true);
  const closeVariantModal = () => {
      setIsVariantModalOpen(false);
      setEditingVariantId(null);
      setNewVariant({ bottleSize: '', actualMRP: 0, sellingMRP: 0, discount: 0, pricePerLiter: 0 });
  };

  const calculateDiscount = (actual: number, selling: number) => {
    return actual > 0 ? Math.round(((actual - selling) / actual) * 100) : 0;
  };

  // --- FAQ HANDLERS ---
  const handleNewFaqChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFaq(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveFaq = () => {
    if (!newFaq.question || !newFaq.answer) {
      alert('Please provide both a question and an answer.');
      return;
    }
    if (editingFaqId) {
      setFaqs(prev => prev.map(f => f.id === editingFaqId ? { ...newFaq, id: editingFaqId } : f));
    } else {
      setFaqs(prev => [...prev, { ...newFaq, id: Date.now() }]);
    }
    closeFaqModal();
  };
  
  const handleEditFaq = (faq: ProductFaq) => {
    setEditingFaqId(faq.id);
    setNewFaq({ question: faq.question, answer: faq.answer });
    setIsFaqModalOpen(true);
  };
  
  const handleDeleteFaq = (id: number) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  const toggleFaq = (id: number) => {
    setOpenFaqId(prevId => (prevId === id ? null : id));
  };

  const openFaqModal = () => setIsFaqModalOpen(true);
  const closeFaqModal = () => {
      setIsFaqModalOpen(false);
      setEditingFaqId(null);
      setNewFaq({ question: '', answer: '' });
  };

  useEffect(() => {
    if (productToEdit) {
        setRemovedExistingOtherImages(productToEdit.otherImages ? new Array(productToEdit.otherImages.length).fill(false) : []);
    }
}, [productToEdit]);

    useEffect(() => {
        if (productToEdit) {
            setMainImageRemoved(false);
        }
    }, [productToEdit]);

  return (
    <div className="bg-gray-50 p-6 sm:p-0 font-sans">
      <div className="space-y-6">
        
        {/* Section 1: Product Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{productToEdit ? 'Edit Product' : 'Add Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
              <input type="text" id="productName" value={formState.productName} onChange={handleFormChange} placeholder="Product Name" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <select id="category" value={formState.category} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]">
                <option value="">Please select a category</option>
                <option value="Groundnut Oil">Groundnut Oil</option>
                <option value="Mustard Oil">Mustard Oil</option>
                <option value="Safflower Oil">Safflower Oil</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-600 mb-1">Short description</label>
              <input type="text" id="shortDescription" value={formState.shortDescription} onChange={handleFormChange} placeholder="Description" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]" />
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-600 mb-1">Rating</label>
              <select id="rating" value={formState.rating} onChange={handleFormChange} className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]">
                <option value="">Select rating</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-600 mb-1">Long description</label>
              <textarea id="longDescription" value={formState.longDescription} onChange={handleFormChange} rows={4} placeholder="Description" className="w-full p-2 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102]"></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Upload Product Image */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Product Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Main Image
                <span className="block text-xs text-blue-600 mt-1">
                  Recommended: <span className="font-semibold">800×800 px, square, under 2MB</span>
                </span>
              </label>
              <input type="file" ref={mainImageInputRef} onChange={handleMainImageChange} className="hidden" accept="image/*" />
              <div onClick={() => mainImageInputRef.current?.click()} className="relative group border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center cursor-pointer hover:border-[#703102] transition-colors">
                {mainImage ? (
                  <>
                    <img src={URL.createObjectURL(mainImage)} alt="Main preview" className="max-h-full max-w-full object-contain" />
                    <button onClick={(e) => { e.stopPropagation(); setMainImage(null); }} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove main image">✕</button>
                  </>
                ) : productToEdit?.mainImage && !mainImageRemoved ? (
                  <>
                    <img src={productToEdit.mainImage} alt="Current main image" className="max-h-full max-w-full object-contain" />
                    <button onClick={(e) => { e.stopPropagation(); setMainImageRemoved(true); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove existing main image">✕</button>
                  </>
                ) : (
                  <p className="text-gray-400 text-center">Click to upload main image</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Other Images (max 5)
                <span className="block text-xs text-blue-600 mt-1">
                  Recommended: <span className="font-semibold">800×800 px, square, under 2MB</span>
                </span>
              </label>
              <input type="file" ref={otherImagesInputRef} onChange={handleOtherImagesChange} className="hidden" accept="image/*" multiple disabled={(otherImages.length + (productToEdit?.otherImages?.length || 0)) >= 5} />
              <div onClick={() => (otherImages.length + (productToEdit?.otherImages?.length || 0)) < 5 && otherImagesInputRef.current?.click()} className={`border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center transition-colors ${(otherImages.length + (productToEdit?.otherImages?.length || 0)) < 5 ? 'cursor-pointer hover:border-[#703102]' : 'cursor-not-allowed bg-gray-100'}`}>
                {(otherImages.length > 0 || (productToEdit?.otherImages && productToEdit.otherImages.length > 0)) ? (
                  <div className="grid grid-cols-3 gap-2 w-full h-full overflow-y-auto">
                    {/* Show existing images from database */}
                    {productToEdit?.otherImages?.map((imageUrl, index) => (
                      !removedExistingOtherImages[index] && (
                        <div key={`existing-${index}`} className="relative group w-full h-24">
                          <img src={imageUrl} alt={`Existing image ${index + 1}`} className="w-full h-full object-cover rounded" />
                          <button onClick={(e) => { e.stopPropagation(); removeExistingOtherImage(index); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove existing image">✕</button>
                        </div>
                      )
                    ))}
                    {/* Show new images being uploaded */}
                    {otherImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group w-full h-24">
                        <img src={URL.createObjectURL(file)} alt={`Other preview ${index + 1}`} className="w-full h-full object-cover rounded" />
                        <button onClick={(e) => { e.stopPropagation(); removeOtherImage(index); }} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">✕</button>
                      </div>
                    ))}
                    {/* Show add more slot if under limit */}
                    {(otherImages.length + (productToEdit?.otherImages?.length || 0)) < 5 && (
                      <div className="w-full h-24 flex items-center justify-center border border-gray-200 rounded text-gray-400 text-sm">
                        Add More ({5 - otherImages.length - (productToEdit?.otherImages?.length || 0)} left)
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">Click to upload images</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="actualMRP" className="block text-md font-semibold text-gray-700 mb-2">Actual MRP*</label>
              <input type="number" id="actualMRP" value={formState.actualMRP > 0 ? formState.actualMRP : ''} onChange={handleFormChange} placeholder="number field" className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sellingMRP" className="block text-md font-semibold text-gray-700 mb-2">Selling MRP*</label>
                <input type="number" id="sellingMRP" value={formState.sellingMRP > 0 ? formState.sellingMRP : ''} disabled placeholder="number field" className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label htmlFor="discount" className="block text-md font-semibold text-gray-700 mb-2">Discount in %</label>
                <input type="number" id="discount" value={formState.discount > 0 ? formState.discount : ''} onChange={handleFormChange} placeholder="number field" className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 4: Variant */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Variant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {variants.map(variant => (
              <div key={variant.id} className="relative group p-4 rounded-lg border flex flex-col" style={{ borderColor: '#703102' }}>
                 <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => handleEditVariant(variant)} className="p-1.5 bg-gray-100 rounded-full hover:bg-amber-100 text-gray-600 hover:text-amber-600" aria-label="Edit Variant">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteVariant(variant.id)} className="p-1.5 bg-gray-100 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600" aria-label="Delete Variant">
                        <Trash2 size={14} />
                    </button>
                 </div>
                <div className="text-sm font-medium text-gray-700 mb-2 py-1 px-3 rounded self-start" style={{ backgroundColor: '#FCD34D' }}>{variant.bottleSize}</div>
                <div className="flex items-center space-x-2 my-1">
                  <span className="text-xl font-bold text-gray-800">₹{variant.sellingMRP}</span>
                  <span className="text-sm text-gray-500 line-through">₹{variant.actualMRP}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-green-800" style={{ backgroundColor: '#A7F3D0' }}>{calculateDiscount(variant.actualMRP, variant.sellingMRP)}% OFF</span>
                </div>
                <p className="text-sm text-gray-600">₹{variant.pricePerLiter}/L</p>
              </div>
            ))}
          </div>
          <button onClick={openVariantModal} className="px-6 py-2 text-white font-semibold rounded-md transition" style={{ backgroundColor: '#703102' }}>ADD MORE</button>
        </div>

        {/* Section 5: Product Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Info</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="ingredients" className="block text-md font-semibold text-gray-700 mb-2">Ingredients</label>
              <textarea id="ingredients" value={formState.ingredients} onChange={handleFormChange} placeholder="text area" rows={4} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50"></textarea>
            </div>
            <div>
              <label htmlFor="benefits" className="block text-md font-semibold text-gray-700 mb-2">Benefits</label>
              <textarea id="benefits" value={formState.benefits} onChange={handleFormChange} placeholder="text area" rows={4} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50"></textarea>
            </div>
            <div>
              <label htmlFor="storageInfo" className="block text-md font-semibold text-gray-700 mb-2">Storage Info</label>
              <textarea id="storageInfo" value={formState.storageInfo} onChange={handleFormChange} placeholder="text area" rows={4} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50"></textarea>
            </div>
          </div>
        </div>

        {/* Section 6: Product Faqs */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Faqs</h2>
          <div className="space-y-2 mb-6">
            {faqs.map(faq => (
              <div key={faq.id} className="relative group border-b border-gray-200 py-2">
                <button onClick={() => toggleFaq(faq.id)} className="w-full flex justify-between items-center text-left text-gray-800">
                  <span className="font-semibold pr-16">{faq.question}</span>
                  <div className="flex items-center absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="flex items-center space-x-2 mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={(e) => { e.stopPropagation(); handleEditFaq(faq); }} className="p-1.5 bg-gray-100 rounded-full hover:bg-amber-100 text-gray-600 hover:text-amber-600" aria-label="Edit FAQ">
                            <Pencil size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFaq(faq.id); }} className="p-1.5 bg-gray-100 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600" aria-label="Delete FAQ">
                            <Trash2 size={12} />
                        </button>
                    </div>
                    <span className="text-xl font-light">{openFaqId === faq.id ? '-' : '+'}</span>
                  </div>
                </button>
                {openFaqId === faq.id && (
                  <div className="mt-2 pl-2 text-gray-600 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={openFaqModal} className="px-6 py-2 text-white font-semibold rounded-md transition" style={{ backgroundColor: '#703102' }}>ADD MORE</button>
        </div>
        
        {/* Footer Buttons */}
        <div className="flex justify-start space-x-4 mt-6">
            <button 
                onClick={handleSave} 
                disabled={isUploading}
                className="px-6 py-2 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: '#703102' }}
            >
                {isUploading ? (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Uploading... {uploadProgress}%</span>
                    </div>
                ) : (
                    productToEdit ? 'UPDATE PRODUCT' : 'ADD PRODUCT'
                )}
            </button>
            <button 
                type="button" 
                onClick={handleReset} 
                disabled={isUploading}
                className="px-6 py-2 text-white font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: '#703102' }}
            >
                RESET
            </button>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
            <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-[#703102] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                    Uploading images to Cloudinary... {uploadProgress}%
                </p>
            </div>
        )}

        {/* Variant Modal */}
        {isVariantModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
              <button onClick={closeVariantModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingVariantId ? 'Edit variant' : 'Add variant'}</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="variant-bottle-size" className="block text-md font-semibold text-gray-700 mb-2">bottle size</label>
                  <select name="bottleSize" value={newVariant.bottleSize} onChange={handleNewVariantChange} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50">
                    <option value="">dropdown like 250ml, 500ml, 1L, 2L, 5L</option>
                    <option value="100 ml">100ml</option><option value="250 ml">250ml</option><option value="500 ml">500ml</option><option value="1 L">1L</option><option value="2 L">2L</option><option value="5 L">5L</option><option value="10 L">10L</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="variant-actual-mrp" className="block text-md font-semibold text-gray-700 mb-2">Actual MRP*</label>
                  <input type="number" id="variant-actual-mrp" name="actualMRP" placeholder="number field" value={newVariant.actualMRP > 0 ? newVariant.actualMRP : ''} onChange={handleNewVariantChange} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="variant-selling-mrp" className="block text-md font-semibold text-gray-700 mb-2">Selling MRP*</label>
                    <input type="number" id="variant-selling-mrp" name="sellingMRP" placeholder="number field" value={newVariant.sellingMRP > 0 ? newVariant.sellingMRP : ''} disabled className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50 bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div>
                    <label htmlFor="variant-discount" className="block text-md font-semibold text-gray-700 mb-2">Discount in %</label>
                    <input type="number" id="variant-discount" name="discount" placeholder="number field" value={newVariant.discount > 0 ? newVariant.discount : ''} onChange={handleNewVariantChange} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
                  </div>
                </div>
                <div>
                  <label htmlFor="variant-price-per-liter" className="block text-md font-semibold text-gray-700 mb-2">price / L</label>
                  <input type="number" id="variant-price-per-liter" name="pricePerLiter" placeholder="number field" value={newVariant.pricePerLiter > 0 ? newVariant.pricePerLiter : ''} onChange={handleNewVariantChange} className="w-full p-3 border-2 border-[#703102] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#703102]/50" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button onClick={closeVariantModal} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md transition hover:bg-gray-400">Cancel</button>
                <button onClick={handleSaveVariant} className="px-6 py-2 text-white font-semibold rounded-md transition" style={{ backgroundColor: '#703102' }}>{editingVariantId ? 'Update Variant' : 'Add Variant'}</button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Modal */}
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

export default AddProduct;