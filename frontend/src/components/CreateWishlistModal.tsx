import { useState, type FormEvent } from 'react';
import { HiX } from 'react-icons/hi';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateWishlistModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CreateWishlistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Wishlist name is required.');
      return;
    }

    try {
      setError(null);
      await onSubmit(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    } catch (err) {
      setError('Unable to create wishlist. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 ease-out">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Wishlist</h2>
            <p className="mt-1 text-sm text-gray-500">Organize your favorite items</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative p-1 text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Close modal"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label htmlFor="wishlist-name" className="block text-sm font-semibold text-gray-900 mb-2">
              Wishlist Name
            </label>
            <input
              id="wishlist-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Summer Picks"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={isLoading}
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="wishlist-description" className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="wishlist-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a description for this wishlist..."
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? 'Creating...' : 'Create Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
