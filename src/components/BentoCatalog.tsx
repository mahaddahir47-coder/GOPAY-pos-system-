import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { PREDEFINED_PRODUCTS } from '../data';

// Helper component to render Icons dynamically from their names
const DynamicIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComp = (Icons as any)[name];
  if (!IconComp) {
    return <Icons.HelpCircle className={className} />;
  }
  return <IconComp className={className} />;
};

interface BentoCatalogProps {
  onAddProduct: (product: Product, customPrice?: number) => void;
}

export const BentoCatalog: React.FC<BentoCatalogProps> = ({ onAddProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all' | 'combos'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridMode, setIsGridMode] = useState(true);
  
  // Custom amount entry form inside bento catalog
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('Custom Charge');
  const [customPriceVal, setCustomPriceVal] = useState('10.00');

  const categories: { value: ProductCategory | 'all' | 'combos'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Items', icon: 'LayoutGrid' },
    { value: 'starters', label: 'Starters', icon: 'Soup' },
    { value: 'mains', label: 'Mains', icon: 'Utensils' },
    { value: 'sides', label: 'Sides', icon: 'Pizza' },
    { value: 'beverages', label: 'Drinks', icon: 'CupSoda' },
    { value: 'desserts', label: 'Desserts', icon: 'Cake' },
    { value: 'combos', label: 'Combos', icon: 'Sparkles' },
  ];

  // Filtering products by category and search query in real-time
  const filteredProducts = PREDEFINED_PRODUCTS.filter(p => {
    // Treat combos as a simulated filter that shows predefined combos or items with price package discounts
    if (selectedCategory === 'combos') {
      return p.price > 12 && p.category === 'mains';
    }
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddCustomProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customPriceVal) || 0;
    if (price <= 0) return;

    const customProd: Product = {
      id: `custom-${Date.now()}`,
      name: customName || 'Custom Charge',
      price: price,
      category: 'custom',
      iconName: 'PlusSquare',
      colorClass: 'bg-indigo-950/40 text-indigo-400 border-indigo-550/30'
    };

    onAddProduct(customProd, price);
    setShowCustomInput(false);
    // Reset back
    setCustomName('Custom Charge');
    setCustomPriceVal('10.00');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Search Header Row Matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Interactive Dark Search Bar */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Icons.Search className="h-4 w-4 text-slate-400/80" />
          </span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b172d]/90 hover:bg-[#0b172d] text-white font-sans text-xs pl-10 pr-10 py-2.5 rounded-xl border border-blue-900/30 focus:border-blue-500/75 outline-none placeholder:text-slate-450 transition-all font-semibold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Icons.X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Layout View Toggles (Grid & List Icons matching the cyan/blue active design) */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0 bg-[#091124] p-1 rounded-xl border border-blue-900/25">
          <button
            type="button"
            onClick={() => setIsGridMode(true)}
            className={`p-1.5 rounded-lg transition-all ${isGridMode ? 'bg-[#183262] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Grid View"
          >
            <Icons.Grid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsGridMode(false)}
            className={`p-1.5 rounded-lg transition-all ${!isGridMode ? 'bg-[#183262] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="List View"
          >
            <Icons.List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Pills Slider / Controls with Dark Bento Aesthetics */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat.value}
            id={`cat-tab-${cat.value}`}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-150 cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-[#183262] text-[#2F80ED] border-[#2F80ED]/40 shadow-sm'
                : 'bg-[#091124]/80 text-[#8C9AA9] border-blue-900/10 hover:bg-[#0f1d39] hover:text-white'
            }`}
          >
            <DynamicIcon name={cat.icon} className="h-3.5 w-3.5" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid Area: Bento Style Layout */}
      <div className="flex-1 min-h-0">
        
        {/* Predefined Food Bento Grid with Unsplash high quality visual assets */}
        <div key={selectedCategory} className="overflow-y-auto max-h-[480px] xl:max-h-[580px] pr-1 space-y-3 scrollbar-thin animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {isGridMode ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredProducts.map((prod) => (
                <button
                  key={prod.id}
                  id={`product-card-${prod.id}`}
                  onClick={() => onAddProduct(prod)}
                  className="bg-[#0b172d]/85 border border-blue-900/20 hover:border-blue-500/40 px-3 py-3 rounded-2xl flex flex-col justify-between min-h-[170px] text-left transition-all duration-150 shadow-sm cursor-pointer hover:bg-[#101F3C] group"
                >
                  {/* Photo cover container with delicious styling */}
                  {prod.imageUrl && (
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 relative bg-slate-950">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-[#011631]/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider font-semibold text-blue-300">
                        {prod.category.toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Product Text Area */}
                  <div className="w-full mt-auto">
                    <h3 className="text-xs font-bold tracking-tight line-clamp-1 leading-snug text-slate-100 group-hover:text-blue-400 transition-colors">
                      {prod.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1 pt-0.5">
                      <span className="text-[13px] font-black font-mono text-slate-205">
                        ${prod.price.toFixed(2)}
                      </span>
                      
                      {/* Round blue add button */}
                      <div className="w-6 h-6 rounded-full bg-[#1c386e] text-[#2F80ED] border border-blue-900/45 group-hover:bg-[#2F80ED] group-hover:text-white flex items-center justify-center transition-all">
                        <Icons.Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Elegant List layout standard table
            <div className="space-y-2">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onAddProduct(prod)}
                  className="bg-[#0b172d]/85 text-left border border-blue-900/20 hover:border-blue-500/30 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-[#0f2144]"
                >
                  <div className="flex items-center space-x-3">
                    {prod.imageUrl && (
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-12 h-12 rounded-lg object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{prod.name}</h4>
                      <p className="text-[10px] text-blue-350 uppercase font-mono">{prod.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-black text-white">${prod.price.toFixed(2)}</span>
                    <div className="w-7 h-7 rounded-full bg-blue-600/10 text-[#2F80ED] flex items-center justify-center hover:bg-[#2F80ED] hover:text-white transition-all">
                      <Icons.Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <Icons.Inbox className="h-8 w-8 mx-auto text-blue-400 mb-2" />
              <p className="text-xs text-blue-200 opacity-80 font-medium">
                No items found matching "{searchQuery}" under {selectedCategory}.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Beautiful Interactive Custom Amount Form Section matching the footer design exactly */}
      <div className="border-t border-blue-900/15 pt-2">
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="w-full bg-[#0a1428]/80 hover:bg-[#0d1c3a] border border-blue-900/20 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer shadow-sm"
          >
            <div className="flex items-center space-x-3 text-slate-200">
              <div className="p-2 rounded-lg bg-blue-950/40 text-blue-400">
                <Icons.FileEdit className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Custom Amount</span>
                <span className="text-[10px] text-slate-400">Add a custom item or billing override</span>
              </div>
            </div>
            <Icons.ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        ) : (
          <form 
            onSubmit={handleAddCustomProduct}
            className="bg-[#091225] border border-blue-900/35 p-3.5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Icons.Sparkles className="h-3.5 w-3.5 text-[#2F80ED]" />
                Define Custom Allocation Charge
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] uppercase tracking-wider font-extrabold text-blue-300">Item Label</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. VIP Service Fee"
                  className="w-full bg-[#030919] border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2F80ED]"
                />
              </div>
              <div>
                <label className="text-[8px] uppercase tracking-wider font-extrabold text-blue-300">Price Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customPriceVal}
                  onChange={(e) => setCustomPriceVal(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#030919] border border-blue-900/50 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#2F85ED]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#2F80ED] hover:bg-blue-600 text-xs font-bold text-white flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Icons.Plus className="h-3.5 w-3.5" />
              <span>Inject Item to Order</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
