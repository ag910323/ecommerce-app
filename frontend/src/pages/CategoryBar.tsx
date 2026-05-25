import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiUser, HiChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../context/CategoryContext";

export default function CategoryBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const { user } = useAuth();
  const { parentCategories } = useCategories();

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
  };

  const handleDropdownMouseEnter = () => {
    // Keep the dropdown open when mouse enters dropdown area
  };

  const handleDropdownMouseLeave = () => {
    setHoveredCategory(null);
  };

  const isSeller = user?.roleNames?.includes("SELLER") ?? false;

  const sections = [
    ...(user ? [
      {
        title: "Account",
        items: [
          { label: "My Profile", href: "/profile" },
          { label: "Orders", href: "/orders" },
        ],
      },
    ] : []),
    ...(isSeller ? [
      {
        title: "Seller Hub",
        items: [
          { label: "Manage Products", href: "/seller/products" },
          { label: "Seller Dashboard", href: "/seller-dashboard" },
        ],
      },
    ] : []),
  ];

  return (
    <>
      {/* Top Category Bar */}
      <div className="w-full bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 text-white flex items-center px-8 py-4 shadow-lg">
  {/* Hamburger Icon */}
  <button
    onClick={() => setIsMenuOpen(true)}
    className="flex items-center space-x-2 hover:text-yellow-300 mr-8 shrink-0 transition-colors"
  >
    <HiMenu className="w-6 h-6" />
    <span className="font-semibold">All</span>
  </button>

  {/* Categories - fixed grid layout without scrolling */}
  <div className="flex items-center flex-wrap gap-6 relative">
    {parentCategories.slice(0, 8).map((category) => (
      <div 
        key={category.id} 
        className="relative group"
        onMouseEnter={() => handleCategoryHover(category.id)}
        onMouseLeave={handleCategoryLeave}
      >
        <Link
          to={`/category/${category.id}`}
          className="text-base text-white hover:text-white whitespace-nowrap transition-colors duration-200 font-medium flex items-center space-x-1 py-2 hover:bg-white hover:bg-opacity-10 rounded px-2"
        >
          <span>{category.name}</span>
          {/* Show down arrow if category has subcategories */}
          {category.subCategories && category.subCategories.length > 0 && (
            <HiChevronDown className="w-3 h-3 opacity-70" />
          )}
        </Link>
        
        {/* Multi-column Dropdown - All levels visible at once */}
        {hoveredCategory === category.id && category.subCategories && category.subCategories.length > 0 && (
          <div 
            className="category-dropdown absolute top-full left-0 mt-1 bg-white shadow-2xl rounded-lg border border-gray-200 z-[100] p-6 min-w-[800px]"
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            {/* Category Header */}
            <div className="mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-slate-800">{category.name}</h3>
              <p className="text-sm text-gray-600">Explore {category.name} categories</p>
            </div>

            {/* Multi-column Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.subCategories.map((subCategory) => (
                <div key={subCategory.id} className="space-y-2">
                  {/* Subcategory Title */}
                  <Link
                    to={`/category/${subCategory.id}`}
                    className="block font-semibold text-blue-700 hover:text-blue-900 text-sm border-b border-blue-100 pb-1 transition-colors"
                    onClick={() => {
                      setHoveredCategory(null);
                    }}
                  >
                    {subCategory.name}
                  </Link>

                  {/* Sub-subcategories */}
                  {subCategory.subCategories && subCategory.subCategories.length > 0 && (
                    <div className="space-y-1 ml-2">
                      {subCategory.subCategories.slice(0, 8).map((subSubCategory) => (
                        <Link
                          key={subSubCategory.id}
                          to={`/category/${subSubCategory.id}`}
                          className="block text-xs text-gray-600 hover:text-blue-600 py-1 transition-colors"
                          onClick={() => {
                            setHoveredCategory(null);
                          }}
                        >
                          {subSubCategory.name}
                        </Link>
                      ))}
                      {/* Show "View More" if there are more than 8 items */}
                      {subCategory.subCategories.length > 8 && (
                        <Link
                          to={`/category/${subCategory.id}`}
                          className="block text-xs text-blue-500 hover:text-blue-700 py-1 font-medium transition-colors"
                          onClick={() => {
                            setHoveredCategory(null);
                          }}
                        >
                          View All ({subCategory.subCategories.length})
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Empty space for categories without sub-subcategories */}
                  {(!subCategory.subCategories || subCategory.subCategories.length === 0) && (
                    <div className="ml-2 py-1">
                      {/* Just empty space - clicking the subcategory title above will show products */}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer with "View All" link */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <Link
                to={`/category/${category.id}`}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                onClick={() => {
                  setHoveredCategory(null);
                }}
              >
                <span>View All in {category.name}</span>
                <HiChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>


      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* FULL overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-[10000]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="fixed top-0 left-0 w-80 h-full bg-white z-[10001] shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="bg-yellow-400 p-4 text-black font-bold text-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <HiUser className="w-6 h-6 text-black" />
                  <span>
                    {user ? `Hello, ${user.firstName || user.username}` : "Hello, Sign in"}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-black hover:text-gray-700"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 space-y-6">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-gray-900 font-bold mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-1 text-gray-700">
                      {section.items.map((item) => (
                        <li key={typeof item === 'string' ? item : item.label}>
                          {typeof item === 'string' ? (
                            // Legacy string format (backward compatibility)
                            (() => {
                              if (item === "Manage Products") {
                                return (
                                  <Link
                                    to="/seller/products"
                                    className="block hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {item}
                                  </Link>
                                );
                              } else if (item === "Seller Dashboard") {
                                return (
                                  <Link
                                    to="/seller-dashboard"
                                    className="block hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {item}
                                  </Link>
                                );
                              }
                              return (
                                <div className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
                                  {item}
                                </div>
                              );
                            })()
                          ) : (
                            // New object format
                            <Link
                              to={item.href}
                              className="block hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                    <hr className="my-3" />
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
