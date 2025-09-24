import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BlogManager from './sections/BlogManager';
import PodcastManager from './sections/PodcastManager';
import TestimonialManager from './sections/TestimonialManager';
import BulkOrderManager from './sections/BulkOrderManager';
import ContactManager from './sections/ContactManager';
import FaqManager from './sections/FaqManager';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('blog');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'blog':
        return <BlogManager />;
      case 'podcast':
        return <PodcastManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'bulk-order':
        return <BulkOrderManager />;
      case 'contact':
        return <ContactManager />;
      case 'faq':
        return <FaqManager />;
      default:
        return <BlogManager />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;