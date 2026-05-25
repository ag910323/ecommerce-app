import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useState, useEffect, memo } from "react";

interface Banner {
  title: string;
  subtitle: string;
  buttonText: string;
  gradient: string;
  image: string;
  link?: string;
}

interface HeroBannerProps {
  banners: Banner[];
}

function HeroBanner({ banners }: HeroBannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-rotate banners every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden bg-black">
      <div 
        className="flex transition-transform ease-in-out"
        style={{ 
          transform: `translateX(-${currentBanner * 100}%)`,
          willChange: 'transform',
          transitionDuration: '500ms'
        }}
      >
        {banners.map((banner, index) => (
          <div 
            key={index}
            className="w-full flex-shrink-0 relative py-16 px-4 min-h-[500px] flex items-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="max-w-7xl mx-auto text-center text-white relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 animate-fade-in drop-shadow-md">
                {banner.subtitle}
              </p>
              <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors animate-fade-in shadow-lg hover:shadow-xl transform hover:scale-105">
                {banner.buttonText}
              </button>
            </div>
            
            {/* Additional gradient overlay for better text readability */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-30`}></div>
          </div>
        ))}
      </div>
      
      {/* Banner indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBanner ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
      
      {/* Manual navigation arrows */}
      <button
        onClick={() => setCurrentBanner((prev) => prev === 0 ? banners.length - 1 : prev - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 backdrop-blur-sm"
      >
        <HiChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 backdrop-blur-sm"
      >
        <HiChevronRight className="w-6 h-6" />
      </button>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-20">
        <div 
          className="h-full bg-yellow-400 transition-all ease-linear"
          style={{ 
            width: `${((currentBanner + 1) / banners.length) * 100}%`,
            transitionDuration: '4000ms'
          }}
        ></div>
      </div>
    </div>
  );
}

export default memo(HeroBanner);
