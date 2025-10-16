import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Trash2, Edit, Plus } from 'lucide-react';

interface SliderText {
    id: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const Slider: React.FC = () => {
    const [sliderTexts, setSliderTexts] = useState<SliderText[]>([]);
    const [newText, setNewText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch slider texts from Firebase
    const fetchSliderTexts = async () => {
        setLoading(true);
        try {
            console.log('🔄 Fetching slider texts from Firebase...');
            const q = query(collection(db, 'slider'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const texts: SliderText[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                texts.push({
                    id: doc.id,
                    text: data.text || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                });
            });
            
            console.log('✅ Slider texts loaded:', texts);
            setSliderTexts(texts);
        } catch (error) {
            console.error('❌ Error fetching slider texts:', error);
            alert('Error loading slider texts from database');
        } finally {
            setLoading(false);
        }
    };

    // Add new slider text
    const handleAddText = async () => {
        if (!newText.trim()) {
            alert('Please enter some text');
            return;
        }

        setSaving(true);
        try {
            console.log('💾 Adding new slider text:', newText);
            
            await addDoc(collection(db, 'slider'), {
                text: newText.trim(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log('✅ Slider text added successfully');
            setNewText('');
            await fetchSliderTexts(); // Refresh the list
            alert('Slider text added successfully!');
        } catch (error) {
            console.error('❌ Error adding slider text:', error);
            alert('Error adding slider text to database');
        } finally {
            setSaving(false);
        }
    };

    // Start editing
    const handleEditStart = (id: string, text: string) => {
        setEditingId(id);
        setEditingText(text);
    };

    // Save edit
    const handleEditSave = async (id: string) => {
        if (!editingText.trim()) {
            alert('Please enter some text');
            return;
        }

        setSaving(true);
        try {
            console.log('💾 Updating slider text:', id, editingText);
            
            await updateDoc(doc(db, 'slider', id), {
                text: editingText.trim(),
                updatedAt: new Date()
            });
            
            console.log('✅ Slider text updated successfully');
            setEditingId(null);
            setEditingText('');
            await fetchSliderTexts(); // Refresh the list
            alert('Slider text updated successfully!');
        } catch (error) {
            console.error('❌ Error updating slider text:', error);
            alert('Error updating slider text in database');
        } finally {
            setSaving(false);
        }
    };

    // Cancel edit
    const handleEditCancel = () => {
        setEditingId(null);
        setEditingText('');
    };

    // Delete slider text
    const handleDelete = async (id: string, text: string) => {
        if (!window.confirm(`Are you sure you want to delete: "${text}"?`)) {
            return;
        }

        setSaving(true);
        try {
            console.log('🗑️ Deleting slider text:', id);
            
            await deleteDoc(doc(db, 'slider', id));
            
            console.log('✅ Slider text deleted successfully');
            await fetchSliderTexts(); // Refresh the list
            alert('Slider text deleted successfully!');
        } catch (error) {
            console.error('❌ Error deleting slider text:', error);
            alert('Error deleting slider text from database');
        } finally {
            setSaving(false);
        }
    };

    // Load slider texts on component mount
    useEffect(() => {
        fetchSliderTexts();
    }, []);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Slider Texts</h1>
            
            {/* Add new text section */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Slider Text</h2>
                <div className="flex gap-4">
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Enter slider text..."
                        className="flex-1 p-3 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102] resize-none"
                        rows={3}
                    />
                    <button
                        onClick={handleAddText}
                        disabled={saving || !newText.trim()}
                        className="px-6 py-3 bg-[#703102] text-white rounded-md hover:bg-[#5a2602] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={16} />
                        {saving ? 'Adding...' : 'Add Text'}
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="text-center py-8">
                    <div className="text-gray-600">Loading slider texts...</div>
                </div>
            )}

            {/* Slider texts list */}
            {!loading && (
                <div className="space-y-4">
                    {sliderTexts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No slider texts found. Add your first slider text above.
                        </div>
                    ) : (
                        sliderTexts.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                {editingId === item.id ? (
                                    // Edit mode
                                    <div className="space-y-4">
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="w-full p-3 border border-[#703102] rounded-md focus:ring-2 focus:ring-[#703102]/50 focus:border-[#703102] resize-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditSave(item.id)}
                                                disabled={saving}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                disabled={saving}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-gray-800 mb-2">{item.text}</p>
                                            <p className="text-sm text-gray-500">
                                                Created: {item.createdAt.toLocaleDateString()} | 
                                                Updated: {item.updatedAt.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditStart(item.id, item.text)}
                                                disabled={saving}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.text)}
                                                disabled={saving}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Slider;