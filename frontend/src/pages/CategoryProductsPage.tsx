import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { useCategories } from '../context/CategoryContext';
import Header from './Header';
import CategoryBar from './CategoryBar';
import ProductCard from '../components/ProductCard';
import type { ProductResponse } from '../types';

export default function CategoryProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { parentCategories } = useCategories();

  // Find category by ID and its parent
  const findCategoryWithParent = (id: number) => {
    for (const parent of parentCategories) {
      if (parent.id === id) return { category: parent, parent: null, grandParent: null };
      if (parent.subCategories) {
        for (const sub of parent.subCategories) {
          if (sub.id === id) return { category: sub, parent: parent, grandParent: null };
          if (sub.subCategories) {
            for (const subSub of sub.subCategories) {
              if (subSub.id === id) return { category: subSub, parent: sub, grandParent: parent };
            }
          }
        }
      }
    }
    return { category: null, parent: null, grandParent: null };
  };

  const { category, parent, grandParent } = categoryId ? findCategoryWithParent(parseInt(categoryId)) : { category: null, parent: null, grandParent: null };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getProductsByCategory(parseInt(categoryId));
        setProducts(data);
      } catch (err: any) {
        setError('No products found');
        setProducts([]); // Set empty products array
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return (
      <>
        <Header />
        <CategoryBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <CategoryBar />
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              {grandParent && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      to={`/category/${grandParent.id}`}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {grandParent.name}
                    </Link>
                  </div>
                </li>
              )}
              {parent && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      to={`/category/${parent.id}`}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {parent.name}
                    </Link>
                  </div>
                </li>
              )}
              {category && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{category.name}</span>
                  </div>
                </li>
              )}
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category ? category.name : 'Products'}
            </h1>
            <p className="text-gray-600">0 products found</p>
          </div>

          {/* No products found */}
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              There are no products available in this category yet.
            </p>
            <Link 
              to="/" 
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <CategoryBar />
      <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              {grandParent && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      to={`/category/${grandParent.id}`}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {grandParent.name}
                    </Link>
                  </div>
                </li>
              )}
              {parent && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      to={`/category/${parent.id}`}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {parent.name}
                    </Link>
                  </div>
                </li>
              )}
              {category && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{category.name}</span>
                  </div>
                </li>
              )}
            </ol>
          </nav>      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category ? category.name : 'Products'}
        </h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            There are no products available in this category yet.
          </p>
          <Link 
            to="/" 
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
              imageIndex={index}
              source="CATEGORY"
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
