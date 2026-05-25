import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import WishlistGrid from '../components/WishlistGrid';
import CreateWishlistModal from '../components/CreateWishlistModal';
import EmptyWishlist from '../components/EmptyWishlist';
import { HiHeart } from 'react-icons/hi';

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    wishlists,
    currentWishlist,
    wishlistItems,
    loading,
    setCurrentWishlist,
    createWishlist,
    removeFromWishlist
  } = useWishlist();

  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingWishlist, setCreatingWishlist] = useState(false);

  const selectedWishlistName = currentWishlist?.name || 'My Wishlist';

  const handleWishlistChange = async (wishlistId: number) => {
    const selected = wishlists.find(w => w.wishlistId === wishlistId);
    if (selected) {
      setError(null);
      await setCurrentWishlist(selected);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!currentWishlist) return;

    try {
      setError(null);
      await removeFromWishlist(productId, currentWishlist.wishlistId);
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from wishlist. Please try again.');
    }
  };

  const handleCreateWishlist = async (name: string, description?: string) => {
    try {
      setError(null);
      setCreatingWishlist(true);
      await createWishlist(name, description);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create wishlist:', err);
      throw err;
    } finally {
      setCreatingWishlist(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-4 inline-flex p-4 rounded-full bg-gray-100">
              <HiHeart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Please Login</h2>
            <p className="text-gray-600 max-w-sm">You need to be logged in to view your wishlist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {selectedWishlistName}
                </h1>
                <p className="text-base text-gray-600">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'}`
                    : 'No items yet'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
                <select
                  value={currentWishlist?.wishlistId ?? ''}
                  onChange={(event) => handleWishlistChange(Number(event.target.value))}
                  className="flex-1 sm:flex-none min-w-[220px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {wishlists.map((wishlist) => (
                    <option key={wishlist.wishlistId} value={wishlist.wishlistId}>
                      {wishlist.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsModalOpen(true);
                  }}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:bg-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  + Create Wishlist
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-8 rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in duration-200">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="aspect-square flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
                  <div className="flex flex-col flex-1 p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                    <div className="flex-1" />
                    <div className="h-11 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlistItems.length > 0 ? (
            <WishlistGrid items={wishlistItems} onRemoveItem={handleRemoveItem} />
          ) : (
            <EmptyWishlist
              wishlistName={selectedWishlistName}
              onBrowseClick={() => navigate('/products')}
              onCreateWishlist={() => {
                setError(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      <CreateWishlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWishlist}
        isLoading={creatingWishlist}
      />
    </div>
  );
}
