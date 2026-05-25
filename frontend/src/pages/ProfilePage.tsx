import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  HiUser,
  HiMail,
  HiLocationMarker,
  HiPhone,
  HiShieldCheck,
  HiOfficeBuilding,
  HiPencil,
  HiX,
  HiCheck,
  HiTrash,
  HiPlus,
  HiArrowLeft,
} from 'react-icons/hi';

interface EditFormData {
  firstName: string;
  lastName: string;
  username: string;
}

interface EditAddressFormData {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const profileImage = (user as any)?.profileImage as string | undefined;
  const userPhone = user?.addresses?.find((address) => address.phoneNumber)?.phoneNumber;
  const sellerProfile = (user?.sellerResponse?.profile ?? {}) as any;
  const sellerImages = Array.isArray(sellerProfile.imageUrls)
    ? sellerProfile.imageUrls
    : Array.isArray(sellerProfile.shopImages)
    ? sellerProfile.shopImages
    : [];
  const mainSellerImage = sellerImages.length > 0 ? sellerImages[0] : undefined;
  const sellerStatus = user?.sellerResponse?.status;
  const sellerStatusBadge = sellerStatus === 'ACTIVE'
    ? 'bg-green-100 text-green-800'
    : sellerStatus === 'PENDING_VERIFICATION'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800';

  const hasSellerProfile = Boolean(
    sellerProfile &&
    (sellerProfile.businessName || sellerProfile.id || sellerProfile.gstNumber || sellerImages.length > 0)
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    username: '',
  });
  const [isAddressesSectionExpanded, setIsAddressesSectionExpanded] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [editAddressFormData, setEditAddressFormData] = useState<EditAddressFormData>({
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingErrors, setEditingErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleEditStart = () => {
    setIsEditing(true);
    setEditingErrors({});
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
    });
    setEditingErrors({});
  };

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editFormData.firstName.trim()) errors.firstName = 'First name is required';
    if (!editFormData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!editFormData.username.trim()) errors.username = 'Username is required';
    setEditingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm()) return;

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          username: editFormData.username,
        }),
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
        });
        setIsEditing(false);
        // Refresh user data would happen here in a real app
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Update failed' }));
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: errorData.message || 'Failed to update profile.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to update profile. Please try again.',
      });
    }
  };

  const handleAddressEditStart = (index: number) => {
    const address = user.addresses[index];
    setEditAddressFormData({
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'India',
      zipCode: address.zipCode || '',
    });
    setEditingAddressIndex(index);
  };

  const handleAddressEditCancel = () => {
    setEditingAddressIndex(null);
    setIsAddingNewAddress(false);
    setEditAddressFormData({
      street: '',
      city: '',
      state: '',
      country: 'India',
      zipCode: '',
    });
    setEditingErrors({});
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editAddressFormData.street.trim()) errors.street = 'Street is required';
    if (!editAddressFormData.city.trim()) errors.city = 'City is required';
    if (!editAddressFormData.state.trim()) errors.state = 'State is required';
    if (!editAddressFormData.zipCode.trim()) errors.zipCode = 'Zip code is required';
    setEditingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressEditSave = async () => {
    if (!validateAddressForm()) return;

    try {
      const response = await fetch(`/api/addresses${editingAddressIndex !== null ? `/${user.addresses[editingAddressIndex].id}` : ''}`, {
        method: editingAddressIndex !== null ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editAddressFormData),
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Address Updated',
          message: editingAddressIndex !== null ? 'Address updated successfully.' : 'New address added successfully.',
        });
        handleAddressEditCancel();
        // Refresh would happen here in a real app
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Operation failed' }));
        addNotification({
          type: 'error',
          title: 'Operation Failed',
          message: errorData.message || 'Failed to save address.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to save address. Please try again.',
      });
    }
  };

  const handleAddressDelete = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const addressId = user.addresses[index].id;
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Address Deleted',
          message: 'Address deleted successfully.',
        });
        // Refresh would happen here
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete address.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to delete address. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <HiUser className="w-8 h-8" />
              My Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your account details and information</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <HiArrowLeft className="w-4 h-4" />
            Go to Home
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {/* Basic Information Section */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-none rounded-full bg-yellow-100 p-1">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-16 w-16 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-yellow-200 text-xl font-semibold text-yellow-800">
                    {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <HiUser className="w-6 h-6" />
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500">Your personal profile details</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditStart}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                <HiPencil className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, firstName: e.target.value });
                      setEditingErrors({ ...editingErrors, firstName: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="First Name"
                  />
                  {editingErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{editingErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, lastName: e.target.value });
                      setEditingErrors({ ...editingErrors, lastName: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Last Name"
                  />
                  {editingErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{editingErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, username: e.target.value });
                    setEditingErrors({ ...editingErrors, username: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Username"
                />
                {editingErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{editingErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  placeholder="Email"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <HiCheck className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  <HiX className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user.firstName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user.lastName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="text-lg font-semibold text-gray-900">{user.username}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HiMail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{userPhone ?? 'Not available'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HiLocationMarker className="w-6 h-6" />
              Addresses
            </h2>
            <button
              onClick={() => setIsAddressesSectionExpanded(!isAddressesSectionExpanded)}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              {isAddressesSectionExpanded ? 'Hide' : 'Show'}
            </button>
          </div>

          {isAddressesSectionExpanded && (
            <>
              {/* Addresses List */}
              <div className="space-y-4 mb-6">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      {editingAddressIndex === index ? (
                        // Address Edit Form
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 mb-4">Edit Address</h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                            <input
                              type="text"
                              value={editAddressFormData.street}
                              onChange={(e) => {
                                setEditAddressFormData({ ...editAddressFormData, street: e.target.value });
                                setEditingErrors({ ...editingErrors, street: '' });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Street Address"
                            />
                            {editingErrors.street && (
                              <p className="mt-1 text-sm text-red-600">{editingErrors.street}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                              <input
                                type="text"
                                value={editAddressFormData.city}
                                onChange={(e) => {
                                  setEditAddressFormData({ ...editAddressFormData, city: e.target.value });
                                  setEditingErrors({ ...editingErrors, city: '' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="City"
                              />
                              {editingErrors.city && (
                                <p className="mt-1 text-sm text-red-600">{editingErrors.city}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                              <input
                                type="text"
                                value={editAddressFormData.state}
                                onChange={(e) => {
                                  setEditAddressFormData({ ...editAddressFormData, state: e.target.value });
                                  setEditingErrors({ ...editingErrors, state: '' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="State"
                              />
                              {editingErrors.state && (
                                <p className="mt-1 text-sm text-red-600">{editingErrors.state}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                              <input
                                type="text"
                                value={editAddressFormData.country}
                                onChange={(e) =>
                                  setEditAddressFormData({ ...editAddressFormData, country: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="Country"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                              <input
                                type="text"
                                value={editAddressFormData.zipCode}
                                onChange={(e) => {
                                  setEditAddressFormData({ ...editAddressFormData, zipCode: e.target.value });
                                  setEditingErrors({ ...editingErrors, zipCode: '' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="Zip Code"
                              />
                              {editingErrors.zipCode && (
                                <p className="mt-1 text-sm text-red-600">{editingErrors.zipCode}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <button
                              onClick={handleAddressEditSave}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                              <HiCheck className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={handleAddressEditCancel}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                              <HiX className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Address Display
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-700">{address.street}</p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-gray-600 text-sm">{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddressEditStart(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit address"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAddressDelete(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete address"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No addresses added yet.</p>
                )}
              </div>

              {/* Add New Address Button */}
              {!isAddingNewAddress && editingAddressIndex === null && (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <HiPlus className="w-4 h-4" />
                  Add New Address
                </button>
              )}

              {/* Add New Address Form */}
              {isAddingNewAddress && (
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        value={editAddressFormData.street}
                        onChange={(e) => {
                          setEditAddressFormData({ ...editAddressFormData, street: e.target.value });
                          setEditingErrors({ ...editingErrors, street: '' });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Street Address"
                      />
                      {editingErrors.street && (
                        <p className="mt-1 text-sm text-red-600">{editingErrors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={editAddressFormData.city}
                          onChange={(e) => {
                            setEditAddressFormData({ ...editAddressFormData, city: e.target.value });
                            setEditingErrors({ ...editingErrors, city: '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="City"
                        />
                        {editingErrors.city && (
                          <p className="mt-1 text-sm text-red-600">{editingErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={editAddressFormData.state}
                          onChange={(e) => {
                            setEditAddressFormData({ ...editAddressFormData, state: e.target.value });
                            setEditingErrors({ ...editingErrors, state: '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="State"
                        />
                        {editingErrors.state && (
                          <p className="mt-1 text-sm text-red-600">{editingErrors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={editAddressFormData.country}
                          onChange={(e) =>
                            setEditAddressFormData({ ...editAddressFormData, country: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={editAddressFormData.zipCode}
                          onChange={(e) => {
                            setEditAddressFormData({ ...editAddressFormData, zipCode: e.target.value });
                            setEditingErrors({ ...editingErrors, zipCode: '' });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Zip Code"
                        />
                        {editingErrors.zipCode && (
                          <p className="mt-1 text-sm text-red-600">{editingErrors.zipCode}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleAddressEditSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        <HiCheck className="w-4 h-4" />
                        Add Address
                      </button>
                      <button
                        onClick={handleAddressEditCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        <HiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Account Status Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HiShieldCheck className="w-6 h-6" />
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <p className="text-lg font-semibold text-gray-900">
                  {user.active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account Locked</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.accountLocked ? 'Locked' : 'Not Locked'}
              </p>
            </div>
          </div>
        </div>

          </div>

          <aside className="space-y-6">
            {hasSellerProfile ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HiOfficeBuilding className="w-6 h-6" />
                  Seller Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellerProfile.businessName && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Business Name</p>
                      <p className="text-lg font-semibold text-gray-900">{sellerProfile.businessName}</p>
                    </div>
                  )}

                  {sellerProfile.gstNumber && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">GST Number (Read-only)</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{sellerProfile.gstNumber}</p>
                    </div>
                  )}

                  {sellerStatus && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Vendor Status</p>
                      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${sellerStatusBadge}`}>
                        {sellerStatus}
                      </p>
                    </div>
                  )}

                  {sellerProfile.registrationDate && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Registration Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(sellerProfile.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {sellerProfile.contacts && sellerProfile.contacts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <HiPhone className="w-5 h-5" />
                      Seller Contacts
                    </h3>
                    <div className="space-y-2">
                      {sellerProfile.contacts.map((contact: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          {contact.phone && <p className="text-sm">Phone: {contact.phone}</p>}
                          {contact.email && <p className="text-sm">Email: {contact.email}</p>}
                          {contact.alternatePhone && <p className="text-sm">Alternate: {contact.alternatePhone}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sellerProfile.bankDetails && sellerProfile.bankDetails.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bank Details (Read-only)</h3>
                    <div className="space-y-2">
                      {sellerProfile.bankDetails.map((bank: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                            <span>Account: {bank.accountNumber?.slice(-4).padStart(bank.accountNumber.length, '*')}</span>
                            <span>Bank: {bank.bankName}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-3xl bg-slate-50 p-4 border border-gray-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Shop Images</h3>
                      <p className="text-sm text-gray-500">Main photo and gallery view</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {sellerImages.length > 0 ? `${sellerImages.length} image${sellerImages.length > 1 ? 's' : ''}` : 'No images'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 h-56">
                      {mainSellerImage ? (
                        <img src={mainSellerImage} alt="Main shop" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">No main image available</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {sellerImages.length > 1 ? (
                        sellerImages.slice(1, 5).map((image: string, idx: number) => (
                          <div key={idx} className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 h-28">
                            <img src={image} alt={`Shop ${idx + 2}`} className="h-full w-full object-cover" />
                          </div>
                        ))
                      ) : (
                        [...Array(3)].map((_, idx) => (
                          <div key={idx} className="flex h-28 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                            No image
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Get Started as a Seller</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      You are not registered as a seller yet. Create your shop and start selling products.
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3 text-yellow-800">
                    <HiOfficeBuilding className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-3xl bg-slate-50 p-4 border border-dashed border-gray-200 text-sm text-gray-500">
                    Your profile is connected, but seller details are not available yet.
                  </div>
                  <button
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-600"
                  >
                    Become a Seller
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
