import React, { useState, useEffect } from 'react';
import {
  FileText,
  Mic,
  Star,
  ShoppingCart,
  MessageCircle,
  HelpCircle,
  LogOut,
  Package,
  Plus, // Changed from ChevronDown
  Minus, // Changed from ChevronUp
  PlusCircle,
  List,
  Gift,
  Award,
  Box,
  Home,
  Image as ImageIcon,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);

  // This hook opens the product dropdown if the active section is a product sub-item.
  useEffect(() => {
    if (activeSection.startsWith('product-')) {
      setIsProductOpen(true);
    }
    if (activeSection === 'banners' || activeSection === 'faq' || activeSection === 'testimonials') {
      setIsHomeOpen(true);
    }
  }, [activeSection]);

  // Menu items split to maintain the requested order around the Product dropdown
  const menuItemsBeforeProduct = [
    { id: 'blog', label: 'Blog', icon: FileText },
  ];
  
  const menuItemsAfterProduct = [
    { id: 'podcast', label: 'Podcast', icon: Mic },
    { id: 'bulk-order', label: 'Bulk Order', icon: ShoppingCart },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const homeSubItems = [
    { id: 'banners', label: 'Banner Manager', icon: ImageIcon },
    { id: 'faq', label: 'FAQ Manager', icon: HelpCircle },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
  ];

  const productSubItems = [
    { id: 'product-add', label: 'Add Product', icon: PlusCircle },
    { id: 'product-list', label: 'Product List', icon: List },
    { id: 'product-add-combo', label: 'Add Combo', icon: Box },
    { id: 'product-list-combo', label: 'Combo List', icon: List },
    { id: 'product-add-gifting', label: 'Add Gifting', icon: Gift },
    { id: 'product-list-gifting', label: 'Gifting List', icon: List },
    { id: 'product-of-the-day', label: 'Product of the Day', icon: Award },
    { id: 'product-best-seller', label: 'Best Seller', icon: Star },
  ];

  const isProductActive = activeSection.startsWith('product-');
  const isHomeActive = activeSection === 'banners' || activeSection === 'faq' || activeSection === 'testimonials';

  // Helper function to render menu buttons to avoid repetition
  const renderMenuItem = (item: { id: string; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={`w-full flex items-center p-3 rounded-lg transition-all ${isCollapsed ? 'justify-center' : 'space-x-3'} ${
          isActive
            ? 'text-amber-900 shadow-lg'
            : 'text-amber-100 hover:bg-amber-700 hover:text-white'
        }`}
        style={{ backgroundColor: isActive ? '#FCE289' : 'transparent' }}
        title={isCollapsed ? item.label : ''}
      >
        <Icon size={20} />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </button>
    );
  };

  return (
    <div
      className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 shadow-xl flex flex-col`}
      style={{ backgroundColor: '#703102' }}
    >
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-amber-700 flex items-center justify-center">
        {!isCollapsed && (
          <img
            src="/logo.png"
            alt="Logo"
            className="w-auto h-18 bg-white p-1 rounded flex-grow"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent looping
              target.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Home Dropdown Section */}
        <div>
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsHomeOpen(true);
              } else {
                setIsHomeOpen(!isHomeOpen);
              }
            }}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${isCollapsed ? 'justify-center' : 'justify-between'} ${
              isHomeActive
                ? 'text-amber-900 shadow-lg'
                : 'text-amber-100 hover:bg-amber-700 hover:text-white'
            }`}
            style={{ backgroundColor: isHomeActive ? '#FCE289' : 'transparent' }}
            title="Home"
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <Home size={20} />
              {!isCollapsed && <span className="font-medium">Home</span>}
            </div>
            {!isCollapsed && (
              isHomeOpen ? <Minus size={20} /> : <Plus size={20} />
            )}
          </button>

          {/* Home Sub-menu */}
          {!isCollapsed && isHomeOpen && (
            <div className="pl-6 pt-2 space-y-1">
              {homeSubItems.map(subItem => {
                const SubIcon = subItem.icon;
                const isSubItemActive = activeSection === subItem.id;
                return (
                  <button
                    key={subItem.id}
                    onClick={() => onSectionChange(subItem.id)}
                    className={`w-full text-left text-sm flex items-center space-x-3 p-2 rounded-md transition-all ${
                      isSubItemActive
                        ? 'font-bold text-amber-900 bg-amber-200/50'
                        : 'text-amber-100 hover:bg-amber-700/50'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Render items before Product */}
        {menuItemsBeforeProduct.map(renderMenuItem)}

        {/* Product Dropdown Section */}
        <div>
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setIsProductOpen(true);
              } else {
                setIsProductOpen(!isProductOpen);
              }
            }}
            className={`w-full flex items-center p-3 rounded-lg transition-all ${isCollapsed ? 'justify-center' : 'justify-between'} ${
              isProductActive
                ? 'text-amber-900 shadow-lg'
                : 'text-amber-100 hover:bg-amber-700 hover:text-white'
            }`}
            style={{ backgroundColor: isProductActive ? '#FCE289' : 'transparent' }}
            title="Product"
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <Package size={20} />
              {!isCollapsed && <span className="font-medium">Product</span>}
            </div>
            {!isCollapsed && (
              isProductOpen ? <Minus size={20} /> : <Plus size={20} />
            )}
          </button>

          {/* Product Sub-menu */}
          {!isCollapsed && isProductOpen && (
            <div className="pl-6 pt-2 space-y-1">
              {productSubItems.map(subItem => {
                const SubIcon = subItem.icon;
                const isSubItemActive = activeSection === subItem.id;
                return (
                  <button
                    key={subItem.id}
                    onClick={() => onSectionChange(subItem.id)}
                    className={`w-full text-left text-sm flex items-center space-x-3 p-2 rounded-md transition-all ${
                      isSubItemActive
                        ? 'font-bold text-amber-900 bg-amber-200/50'
                        : 'text-amber-100 hover:bg-amber-700/50'
                    }`}
                  >
                    <SubIcon size={16} />
                    <span>{subItem.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Render items after Product */}
        {menuItemsAfterProduct.map(renderMenuItem)}
      </nav>

      {/* Logout */}
      <div className="p-2 sm:p-4 border-t border-amber-700">
        <button
          onClick={onLogout}
          className={`w-full flex items-center p-3 rounded-lg text-amber-100 hover:bg-red-600 hover:text-white transition-colors ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;