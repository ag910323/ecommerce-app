import { useBrands } from '../context/BrandContext';

interface PopularBrandsProps {
  className?: string;
}

export default function PopularBrands({ className = '' }: PopularBrandsProps) {
  const { popularBrands, loading, error } = useBrands();

  if (loading) {
    return (
      <section className={`py-8 bg-white border-b border-gray-200 overflow-hidden ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6 mx-auto"></div>
            <div className="flex space-x-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 bg-gray-200 h-16 w-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || popularBrands.length === 0) {
    // Show fallback content if there's an error but we have mock data
    if (popularBrands.length > 0) {
      // Continue to render with mock data
    } else {
      return null; // Don't show the section if there's an error and no data
    }
  }

  // Create the brand display format - use API logo if available, else emoji fallback
  const getBrandEmoji = (brandName: string) => {
    const emojiMap: Record<string, string> = {
      'Apple': '🍎',
      'Samsung': '📱', 
      'Nike': '✓',
      'Adidas': '🏃',
      'Sony': '🎮',
      'Canon': '📷',
      'HP': '🖥️',
      'Dell': '💻',
      'LG': '📺',
      'Puma': '🐾',
      'Reebok': '👟',
      'Nikon': '📸',
      'Levi\'s': '👖',
      'Zara': '👗',
      'H&M': '👕',
      'Ray-Ban': '🕶️',
      'IKEA': '🏠',
      'Philips': '💡',
      'L\'Oréal': '💄',
      'Maybelline': '💋',
      'Nestlé': '🍫',
      'Britannia': '🍪',
      'Lego': '🧱',
      'Penguin Random House': '📚'
    };
    return emojiMap[brandName] || "🏷️";
  };

  // Get partnership badge color
  const getPartnershipBadgeColor = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return 'bg-red-500';
      case 'TOP': return 'bg-gold-500';
      case 'FEATURED': return 'bg-purple-500';
      case 'PARTNER': return 'bg-blue-500';
      default: return null;
    }
  };

  const brandDisplay = popularBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    logo: brand.logo || getBrandEmoji(brand.name), // Use API logo if available, else emoji
    partnershipBadge: brand.partnershipBadge,
    partnershipLevel: brand.partnershipLevel,
    badgeColor: getPartnershipBadgeColor(brand.partnershipLevel)
  }));

  return (
    <section className={`py-8 bg-white border-b border-gray-200 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Popular Brands</h2>
        <div className="relative">
          <div className="flex animate-scroll space-x-8">
            {/* Double the brands for seamless infinite scroll */}
            {[...brandDisplay, ...brandDisplay].map((brand, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 relative bg-gray-50 px-6 py-4 rounded-lg border hover:shadow-md transition-all cursor-pointer hover:bg-orange-50 group"
              >
                {/* Partnership Badge */}
                {brand.partnershipBadge && brand.badgeColor && (
                  <div className={`absolute -top-2 -right-2 ${brand.badgeColor} text-white px-2 py-1 rounded-full text-xs font-semibold z-10 shadow-md`}>
                    {brand.partnershipBadge}
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform">
                    {brand.logo?.startsWith('http') || brand.logo?.startsWith('/') ? (
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.currentTarget;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) fallback.style.display = 'inline';
                        }}
                      />
                    ) : (
                      <span>{brand.logo}</span>
                    )}
                    {brand.logo?.startsWith('http') || brand.logo?.startsWith('/') ? (
                      <span style={{display: 'none'}} className="fallback-emoji">
                        {getBrandEmoji(brand.name)}
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 whitespace-nowrap group-hover:text-orange-600 transition-colors">
                      {brand.name}
                    </span>
                    {brand.partnershipBadge && (
                      <span className="text-xs text-gray-500 mt-1">
                        {brand.partnershipBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
