import { memo } from "react";

interface Category {
  name: string;
  image: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="text-center group cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(CategoriesSection);
