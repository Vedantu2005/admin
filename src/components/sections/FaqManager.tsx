import React, { useState } from 'react';
import { Plus, Edit2, Trash2, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  isExpanded?: boolean;
}

const FaqManager: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([
    {
      id: '1',
      question: 'What services do you offer?',
      answer: 'We offer a comprehensive range of services including web development, mobile app development, digital marketing, and business consulting. Our team specializes in creating custom solutions tailored to meet your specific business needs and objectives.',
      isExpanded: false
    },
    {
      id: '2',
      question: 'How long does a typical project take?',
      answer: 'Project timelines vary depending on the scope and complexity of the work. Simple websites typically take 2-4 weeks, while complex web applications can take 2-6 months. We provide detailed project timelines during the initial consultation phase and keep you updated throughout the development process.',
      isExpanded: false
    },
    {
      id: '3',
      question: 'Do you provide ongoing support and maintenance?',
      answer: 'Yes, we offer comprehensive support and maintenance packages for all our projects. This includes regular updates, security patches, performance optimization, and technical support. We have different support tiers available to match your specific needs and budget requirements.',
      isExpanded: false
    },
    {
      id: '4',
      question: 'What is your pricing structure?',
      answer: 'Our pricing is project-based and depends on various factors including complexity, timeline, and specific requirements. We offer competitive rates and provide detailed quotes after understanding your project needs. We also offer flexible payment plans and can work within different budget ranges.',
      isExpanded: false
    }
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      setFaqs(faqs.map(faq => 
        faq.id === editingFaq.id 
          ? { ...formData, id: editingFaq.id, isExpanded: false }
          : faq
      ));
    } else {
      setFaqs([...faqs, { ...formData, id: Date.now().toString(), isExpanded: false }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: ''
    });
    setIsFormOpen(false);
    setEditingFaq(null);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const toggleExpand = (id: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id 
        ? { ...faq, isExpanded: !faq.isExpanded }
        : faq
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>FAQ Management</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#499E47' }}
        >
          <Plus size={20} />
          <span>Add New FAQ</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>
            {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter the detailed answer here..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#499E47' }}
              >
                {editingFaq ? 'Update' : 'Create'} FAQ
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(faq.id)}
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(faq);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(faq.id);
                  }}
                  className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {faq.isExpanded ? (
                  <ChevronUp className="text-gray-400" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </div>
            </div>
            
            {faq.isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first FAQ.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqManager;