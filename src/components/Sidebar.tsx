import React from 'react';
import { 
  FileText, 
  Mic, 
  Star, 
  ShoppingCart, 
  MessageCircle, 
  HelpCircle,
  LogOut,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'podcast', label: 'Podcast', icon: Mic },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'bulk-order', label: 'Bulk Order', icon: ShoppingCart },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 shadow-xl flex flex-col`}
      style={{ backgroundColor: '#703102' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-58 h-18  bg-white p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'text-amber-900 shadow-lg' 
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
              style={{ backgroundColor: isActive ? '#FCE289' : 'transparent' }}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-amber-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-amber-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;