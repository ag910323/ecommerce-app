import { useState, useEffect } from 'react';
import { brandApi, type BrandResponse } from '../api/brandApi';
import { HiStar, HiShieldCheck, HiLightningBolt, HiHeart } from 'react-icons/hi';

interface PartnerBrandsProps {
  className?: string;
}

export default function PartnerBrands({ className = '' }: PartnerBrandsProps) {
  const [partnerBrands, setPartnerBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadPartnerBrands();
  }, []);

  const loadPartnerBrands = async () => {
    try {
      setLoading(true);
      const brands = await brandApi.getPartnerBrands(12);
      setPartnerBrands(brands);
      setError('');
    } catch (err: any) {
      console.error('Failed to load partner brands:', err);
      setError('Failed to load partner brands');
      
      // Fallback mock data with partnership levels
      setPartnerBrands([
        { id: 1, name: "Apple", partnershipLevel: "EXCLUSIVE", partnershipBadge: "Exclusive Partner", logo: "🍎" },
        { id: 2, name: "Samsung", partnershipLevel: "TOP", partnershipBadge: "Top Brand", logo: "📱" },
        { id: 3, name: "Nike", partnershipLevel: "FEATURED", partnershipBadge: "Featured Brand", logo: "✓" },
        { id: 4, name: "Sony", partnershipLevel: "PARTNER", partnershipBadge: "Brand Partner", logo: "🎮" },
        { id: 5, name: "Canon", partnershipLevel: "FEATURED", partnershipBadge: "Featured Brand", logo: "📷" },
        { id: 6, name: "Dell", partnershipLevel: "PARTNER", partnershipBadge: "Brand Partner", logo: "💻" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipIcon = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return <HiStar className="w-5 h-5 text-red-500" />;
      case 'TOP': return <HiLightningBolt className="w-5 h-5 text-yellow-500" />;
      case 'FEATURED': return <HiShieldCheck className="w-5 h-5 text-purple-500" />;
      case 'PARTNER': return <HiHeart className="w-5 h-5 text-blue-500" />;
      default: return null;
    }
  };

  const getPartnershipColor = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return 'border-red-200 bg-red-50 hover:bg-red-100';
      case 'TOP': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'FEATURED': return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'PARTNER': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getBadgeColor = (level?: string) => {
    switch (level) {
      case 'EXCLUSIVE': return 'bg-red-500 text-white';
      case 'TOP': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'FEATURED': return 'bg-purple-500 text-white';
      case 'PARTNER': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <section className={`py-12 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8 mx-auto"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && partnerBrands.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Brand Partners</h2>
          <p className="text-gray-600">Trusted brands with verified quality and exclusive benefits</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partnerBrands.map((brand) => (
            <div
              key={brand.id}
              className={`relative group cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${getPartnershipColor(brand.partnershipLevel)}`}
            >
              {/* Partnership Badge */}
              {brand.partnershipBadge && (
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-md ${getBadgeColor(brand.partnershipLevel)}`}>
                  {brand.partnershipBadge}
                </div>
              )}

              {/* Partnership Icon */}
              <div className="absolute top-2 left-2">
                {getPartnershipIcon(brand.partnershipLevel)}
              </div>

              <div className="flex flex-col items-center text-center">
                {/* Brand Logo */}
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {brand.logo?.startsWith('http') || brand.logo?.startsWith('/') ? (
                    <img 
                      src={brand.logo} 
                      alt={`${brand.name} logo`}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {brand.logo || "🏷️"}
                    </span>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-gray-900">
                  {brand.name}
                </h3>

                {/* Partnership Level */}
                {brand.partnershipLevel && brand.partnershipLevel !== 'NONE' && (
                  <span className="text-xs text-gray-500 capitalize">
                    {brand.partnershipLevel.toLowerCase().replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Partnership Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <HiShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Verified Quality</h4>
            <p className="text-sm text-gray-600">All partner brands undergo strict quality verification</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <HiLightningBolt className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Fast Delivery</h4>
            <p className="text-sm text-gray-600">Priority shipping and faster delivery times</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <HiStar className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Exclusive Deals</h4>
            <p className="text-sm text-gray-600">Special discounts and member-only offers</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <HiHeart className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Customer Support</h4>
            <p className="text-sm text-gray-600">Enhanced customer service and warranty support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
