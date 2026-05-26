import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed, HiOfficeBuilding, HiTruck, HiPhone, HiLocationMarker, HiCreditCard, HiShieldCheck, HiClock, HiRefresh } from 'react-icons/hi';
import { useNotification } from '../context/NotificationContext';
import { publicAxios } from '../api/axios';

type RoleType = 'CUSTOMER' | 'SELLER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPPORT';

interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Contact {
  phone: string;
  email: string;
  alternatePhone?: string;
  supportContact?: boolean;
}

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isWarehouse?: boolean;
}

interface BankDetail {
  accountNumber: string;
  accountType: string;
  ifscCode: string;
  bankName: string;
}

interface Document {
  documentType: string;
  documentUrl: string;
  remarks?: string;
}

interface DeliveryPartnerDocument {
  documentType: string;
  documentUrl: string;
}

interface DeliveryPartnerRequest {
  fullName: string;
  vehicleType: string;
  vehicleNumber: string;
  documents?: DeliveryPartnerDocument[];
}

interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userAddresses?: UserAddress[];
  roles: RoleType[];
  
  // Seller specific fields
  businessName?: string;
  gstNumber?: string;
  registrationDate?: string;
  contacts?: Contact[];
  addresses?: Address[];
  bankDetails?: BankDetail[];
  documents?: Document[];
  
  // Delivery Partner specific fields
  deliveryPartner?: DeliveryPartnerRequest;
}

export default function RegisterPage() {
  const { addNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const isSellerRegistration = searchParams.get('seller') === 'true';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const [formData, setFormData] = useState<UserRegistrationRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userAddresses: [{ street: '', city: '', state: '', country: 'India', zipCode: '' }],
    roles: isSellerRegistration ? ['SELLER'] : ['CUSTOMER'],
    contacts: [{ phone: '', email: '', alternatePhone: '', supportContact: false }],
    addresses: [{ addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', zipCode: '', isWarehouse: false }],
    bankDetails: [{ accountNumber: '', accountType: '', ifscCode: '', bankName: '' }],
    documents: [{ documentType: '', documentUrl: '', remarks: '' }],
    deliveryPartner: { fullName: '', vehicleType: '', vehicleNumber: '', documents: [{ documentType: '', documentUrl: '' }] }
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation states
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const emailTimeoutRef = useRef<number | null>(null);
  const usernameTimeoutRef = useRef<number | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'email') {
      setEmailAvailable(null);
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      emailTimeoutRef.current = setTimeout(() => {
        checkEmail(value);
      }, 500);
    } else if (field === 'username') {
      setUsernameAvailable(null);
      if (usernameTimeoutRef.current) clearTimeout(usernameTimeoutRef.current);
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsername(value);
      }, 500);
    }
  };

  const handleContactChange = (index: number, field: string, value: string | boolean) => {
    const updatedContacts = [...(formData.contacts || [])];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const handleAddressChange = (index: number, field: string, value: string | boolean) => {
    const updatedAddresses = [...(formData.addresses || [])];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
  };

  const handleUserAddressChange = (index: number, field: string, value: string) => {
    const updatedUserAddresses = [...(formData.userAddresses || [])];
    updatedUserAddresses[index] = { ...updatedUserAddresses[index], [field]: value };
    setFormData(prev => ({ ...prev, userAddresses: updatedUserAddresses }));
  };

  const addUserAddress = () => {
    setFormData(prev => ({
      ...prev,
      userAddresses: [...(prev.userAddresses || []), { street: '', city: '', state: '', country: 'India', zipCode: '' }]
    }));
  };

  const removeUserAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      userAddresses: prev.userAddresses?.filter((_, i) => i !== index) || []
    }));
  };

  const handleBankDetailChange = (index: number, field: string, value: string) => {
    const updatedBankDetails = [...(formData.bankDetails || [])];
    updatedBankDetails[index] = { ...updatedBankDetails[index], [field]: value };
    setFormData(prev => ({ ...prev, bankDetails: updatedBankDetails }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), { phone: '', email: '', alternatePhone: '', supportContact: false }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index) || []
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', zipCode: '', isWarehouse: false }]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index) || []
    }));
  };

  const addBankDetail = () => {
    setFormData(prev => ({
      ...prev,
      bankDetails: [...(prev.bankDetails || []), { accountNumber: '', accountType: '', ifscCode: '', bankName: '' }]
    }));
  };

  const removeBankDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const handleDeliveryPartnerChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryPartner: { ...(prev.deliveryPartner || {}), [field]: value } as any
    }));
  };

  const handleDocumentChange = (index: number, field: string, value: string) => {
    const updatedDocuments = [...(formData.documents || [])];
    updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };
    setFormData(prev => ({ ...prev, documents: updatedDocuments }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      // Industry standard password validation (Amazon-like)
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const password = formData.password;
        if (password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(password)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(password)) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!/(?=.*[@$!%*?&])/.test(password)) {
          newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
        }
      }
      
      if (formData.password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      // Check real-time validation
      if (emailAvailable === false) newErrors.email = 'Email already exists';
      if (usernameAvailable === false) newErrors.username = 'Username already exists';
      
      // No role validation needed - roles are automatically assigned based on URL
    }

    if (step === 2 && isSellerRegistration) {
      if (!formData.businessName?.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.gstNumber?.trim()) newErrors.gstNumber = 'GST number is required';
      
      // Validate at least one contact
      if (!formData.contacts?.some(contact => contact.phone.trim() || contact.email.trim())) {
        newErrors.contacts = 'At least one contact (phone or email) is required';
      }
      
      // Validate at least one address
      if (!formData.addresses?.some(addr => addr.addressLine1.trim() && addr.city.trim() && addr.state.trim() && addr.zipCode.trim())) {
        newErrors.addresses = 'At least one business address is required';
      }
      
      // Validate at least one bank detail
      if (!formData.bankDetails?.some(bank => bank.accountNumber.trim() && bank.ifscCode.trim() && bank.bankName.trim())) {
        newErrors.bankDetails = 'At least one bank account is required';
      }
    }

    if (step === 3 && isSellerRegistration) {
      // Validate documents if required
      // For now, documents are optional but can add validation here if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (emailChecking || usernameChecking) {
      addNotification({
        type: 'warning',
        title: 'Please Wait',
        message: 'Checking email/username availability...',
      });
      return;
    }
    if (validateStep(currentStep)) {
      // For seller registration, always go through all steps
      if (isSellerRegistration) {
        setCurrentStep(prev => prev + 1);
      } else {
        // For customer registration, submit directly after basic info
        if (currentStep === 1) {
          handleSubmit();
        } else {
          setCurrentStep(prev => prev + 1);
        }
      }
    }
  };

  const handlePrevStep = () => {
    // For seller registration, always go back one step
    if (isSellerRegistration) {
      setCurrentStep(prev => prev - 1);
    } else {
      // For customer registration, go back one step (should only be from step 2, but kept for safety)
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Clean up the data before sending
      const cleanData = { ...formData };

      // For seller registration, ensure all required fields are present
      if (isSellerRegistration) {
        // Clean contacts - remove empty entries
        if (cleanData.contacts) {
          cleanData.contacts = cleanData.contacts.filter(contact =>
            contact.phone.trim() || contact.email.trim()
          );
        }

        // Clean addresses - remove empty entries
        if (cleanData.addresses) {
          cleanData.addresses = cleanData.addresses.filter(address =>
            address.addressLine1.trim() && address.city.trim() && address.state.trim() && address.zipCode.trim()
          );
        }

        // Clean bank details - remove empty entries
        if (cleanData.bankDetails) {
          cleanData.bankDetails = cleanData.bankDetails.filter(bank =>
            bank.accountNumber.trim() && bank.ifscCode.trim() && bank.bankName.trim()
          );
        }

        // Clean documents - remove empty entries
        if (cleanData.documents) {
          cleanData.documents = cleanData.documents.filter(document =>
            document.documentType && document.documentUrl
          );
          if (cleanData.documents.length === 0) {
            delete cleanData.documents;
          }
        }

        // Remove userAddresses for sellers (not needed)
        delete cleanData.userAddresses;

        // Remove deliveryPartner for sellers
        delete cleanData.deliveryPartner;
      } else {
        // For non-seller registrations, clean up as before
        // Remove empty userAddresses
        if (cleanData.userAddresses) {
          cleanData.userAddresses = cleanData.userAddresses.filter(addr =>
            addr.street.trim() && addr.city.trim() && addr.state.trim() && addr.zipCode.trim()
          );
          if (cleanData.userAddresses.length === 0) {
            delete cleanData.userAddresses;
          }
        }

        // Remove empty or irrelevant fields based on registration type
        if (!isSellerRegistration) {
          delete cleanData.businessName;
          delete cleanData.gstNumber;
          delete cleanData.registrationDate;
          delete cleanData.contacts;
          delete cleanData.addresses;
          delete cleanData.bankDetails;
          delete cleanData.documents;
        }

        // Delivery partner is not supported in current implementation
        delete cleanData.deliveryPartner;
      }

      try {
        await publicAxios.post('/api/public/users/register', cleanData);

        setShowOtpVerification(true);
        
        addNotification({
          type: 'success',
          title: 'Registration Successful!',
          message: `A verification code has been sent to ${formData.email}. Please check your inbox.`
        });
        
        // Clear any previous errors
        setErrors({});
      } catch (error: any) {
        const errorData = error?.response?.data ?? { message: 'Registration failed' };
        const errorMessage = errorData.message || 'Registration failed';
        setErrors({ submit: errorMessage });
        
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: errorMessage
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Network error. Please try again.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running on localhost:5454';
      }
      
      setErrors({ submit: errorMessage });
      
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrors({ otp: 'OTP is required' });
      addNotification({
        type: 'error',
        title: 'OTP Required',
        message: 'Please enter the 6-digit verification code.'
      });
      return;
    }

    if (otpCode.trim().length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      addNotification({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter a valid 6-digit verification code.'
      });
      return;
    }

    setLoading(true);
    try {
      await publicAxios.post('/api/public/users/verify-otp', {
        email: formData.email,
        code: otpCode
      });

      addNotification({
        type: 'success',
        title: 'Email Verified Successfully!',
        message: 'Your account has been created. You can now login.'
      });
      
      // Clear any existing errors
      setErrors({ otp: '' });
      
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error: any) {
      const errorData = error?.response?.data ?? {};
      const errorMessage = errorData.message || 'Invalid OTP';
      setErrors({ otp: errorMessage });
      
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) {
      addNotification({
        type: 'warning',
        title: 'Please Wait',
        message: `You can resend OTP in ${resendCooldown} seconds.`
      });
      return;
    }

    setLoading(true);
    try {
      await publicAxios.post('/api/public/users/resend-otp', {
        email: formData.email,
        code: ''
      });

      addNotification({
        type: 'success',
        title: 'OTP Resent Successfully!',
        message: `A new verification code has been sent to ${formData.email}`
      });
      
      setErrors({ otp: '' });
      setOtpCode(''); // Clear the current OTP input
      
      // Start cooldown timer
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      const errorData = error?.response?.data ?? {};
      const errorMessage = errorData.message || 'Failed to resend OTP';
      setErrors({ otp: errorMessage });
      
      addNotification({
        type: 'error',
        title: 'Resend Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation functions
  const checkEmail = async (email: string) => {
    if (!email.trim()) return;

    setEmailChecking(true);
    try {
      const result = await publicAxios.get<{ data: boolean }>(`/api/public/users/check-email?email=${encodeURIComponent(email)}`);
      if (result?.data && typeof result.data.data !== 'undefined') {
        setEmailAvailable(!result.data.data);
      } else {
        setEmailAvailable(null);
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  const checkUsername = async (username: string) => {
    if (!username.trim()) return;

    setUsernameChecking(true);
    try {
      const result = await publicAxios.get<{ data: boolean }>(`/api/public/users/check-username?username=${encodeURIComponent(username)}`);
      if (result?.data && typeof result.data.data !== 'undefined') {
        setUsernameAvailable(!result.data.data);
      } else {
        setUsernameAvailable(null);
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Header with icon */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <HiShieldCheck className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-base font-semibold text-gray-900 mb-4">
              {formData.email}
            </p>
            <p className="text-xs text-gray-500">
              Please check your inbox and enter the code below
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <HiMail className="inline w-4 h-4 mr-2" />
                  Enter Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      setOtpCode(value);
                      // Clear errors when user starts typing
                      if (errors.otp) {
                        setErrors({ otp: '' });
                      }
                    }}
                    className={`block w-full px-4 py-3 text-lg font-mono text-center border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 tracking-wider ${
                      errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="123456"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                  {otpCode.length === 6 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.otp && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.otp}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <HiShieldCheck className="w-4 h-4 mr-2" />
                      Verify Email
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <HiClock className="w-4 h-4 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <HiRefresh className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Didn't receive the code? Check your spam folder or{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={loading || resendCooldown > 0}
                    className="text-orange-600 hover:text-orange-500 font-medium"
                  >
                    resend
                  </button>
                </p>
              </div>

              {/* Back to registration */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtpCode('');
                    setErrors({ otp: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            {isSellerRegistration ? (
              // 3-step progress for SELLER registration
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                    1
                  </div>
                  <div className="ml-2 text-sm font-medium">Basic Info</div>
                </div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                    2
                  </div>
                  <div className="ml-2 text-sm font-medium">Business Details</div>
                </div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 3 ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                    3
                  </div>
                  <div className="ml-2 text-sm font-medium">Documents & Review</div>
                </div>
              </div>
            ) : (
              // 1-step progress for CUSTOMER registration
              <div className="flex items-center">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-yellow-600 border-yellow-600 text-white' : 'border-gray-300'}`}>
                    1
                  </div>
                  <div className="ml-2 text-sm font-medium">Basic Info</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1 relative">
                    <HiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="First Name"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative">
                    <HiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Last Name"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 relative">
                  <HiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Username"
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                {usernameChecking && <p className="mt-1 text-sm text-blue-600">Checking username availability...</p>}
                {usernameAvailable === true && <p className="mt-1 text-sm text-green-600">✓ Username is available</p>}
                {usernameAvailable === false && <p className="mt-1 text-sm text-red-600">✗ Username is already taken</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <HiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Email Address"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                {emailChecking && <p className="mt-1 text-sm text-blue-600">Checking email availability...</p>}
                {emailAvailable === true && <p className="mt-1 text-sm text-green-600">✓ Email is available</p>}
                {emailAvailable === false && <p className="mt-1 text-sm text-red-600">✗ Email is already in use</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <HiLockClosed className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Password"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  <div className="mt-1 text-xs text-gray-500">
                    Password must contain: 8+ characters, uppercase, lowercase, number, and special character
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <HiLockClosed className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Confirm Password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* User Addresses Section - Only for non-seller registration */}
              {!isSellerRegistration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <HiLocationMarker className="inline w-5 h-5 mr-2" />
                    Delivery Addresses (Optional)
                  </label>
                  <div className="space-y-4">
                    {formData.userAddresses?.map((address, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Address {index + 1}
                          </h4>
                          {(formData.userAddresses?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeUserAddress(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={address.street}
                              onChange={(e) => handleUserAddressChange(index, 'street', e.target.value)}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Street address"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={address.city}
                              onChange={(e) => handleUserAddressChange(index, 'city', e.target.value)}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={address.state}
                              onChange={(e) => handleUserAddressChange(index, 'state', e.target.value)}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              ZIP Code *
                            </label>
                            <input
                              type="text"
                              value={address.zipCode}
                              onChange={(e) => handleUserAddressChange(index, 'zipCode', e.target.value)}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="ZIP Code"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              value={address.country}
                              onChange={(e) => handleUserAddressChange(index, 'country', e.target.value)}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addUserAddress}
                      className="flex items-center text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      <HiLocationMarker className="w-4 h-4 mr-1" />
                      Add Another Address
                    </button>
                  </div>
                </div>
              )}

              {/* Seller Registration Notice */}
              {isSellerRegistration && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <HiOfficeBuilding className="w-5 h-5 text-orange-600 mr-2" />
                    <h3 className="text-sm font-medium text-orange-800">Seller Account Registration</h3>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    You're registering as a seller. Next, we'll collect your business details and required documents.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {isSellerRegistration ? 'Continue to Business Details' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Details (Seller) or Role-specific Details (Others) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {isSellerRegistration ? (
                /* Seller Business Details */
                <>
                  <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                    <h3 className="text-lg font-medium text-orange-900 mb-4 flex items-center">
                      <HiOfficeBuilding className="w-5 h-5 mr-2" />
                      Business Information
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-orange-800">Business Name *</label>
                          <input
                            type="text"
                            value={formData.businessName || ''}
                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                            placeholder="Your Business Name"
                          />
                          {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-orange-800">GST Number *</label>
                          <input
                            type="text"
                            value={formData.gstNumber || ''}
                            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                            placeholder="GST123456789"
                          />
                          {errors.gstNumber && <p className="mt-1 text-sm text-red-600">{errors.gstNumber}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiPhone className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    {errors.contacts && <p className="mb-3 text-sm text-red-600">{errors.contacts}</p>}
                    {formData.contacts?.map((contact, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 border border-gray-200 rounded relative">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={contact.phone}
                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                          <input
                            type="email"
                            placeholder="Contact Email"
                            value={contact.email}
                            onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone (Optional)</label>
                          <input
                            type="tel"
                            placeholder="Alternate Phone"
                            value={contact.alternatePhone || ''}
                            onChange={(e) => handleContactChange(index, 'alternatePhone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                          {(formData.contacts?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addContact}
                      className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <span className="mr-1">+</span> Add Another Contact
                    </button>
                  </div>

                  {/* Business Addresses */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiLocationMarker className="w-5 h-5 mr-2" />
                      Business Addresses
                    </h3>
                    {errors.addresses && <p className="mb-3 text-sm text-red-600">{errors.addresses}</p>}
                    {formData.addresses?.map((address, index) => (
                      <div key={index} className="space-y-3 mb-4 p-3 border border-gray-200 rounded relative">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Address {index + 1}</h4>
                          {(formData.addresses?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                            <input
                              type="text"
                              placeholder="Address Line 1"
                              value={address.addressLine1}
                              onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                            <input
                              type="text"
                              placeholder="Address Line 2"
                              value={address.addressLine2 || ''}
                              onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                              type="text"
                              placeholder="City"
                              value={address.city}
                              onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input
                              type="text"
                              placeholder="State"
                              value={address.state}
                              onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                            <input
                              type="text"
                              placeholder="Country"
                              value={address.country}
                              onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                            <input
                              type="text"
                              placeholder="ZIP Code"
                              value={address.zipCode}
                              onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isWarehouse || false}
                            onChange={(e) => handleAddressChange(index, 'isWarehouse', e.target.checked)}
                            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-700">This is a warehouse address</label>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAddress}
                      className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <span className="mr-1">+</span> Add Another Address
                    </button>
                  </div>

                  {/* Bank Details */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <HiCreditCard className="w-5 h-5 mr-2" />
                      Bank Account Details
                    </h3>
                    {errors.bankDetails && <p className="mb-3 text-sm text-red-600">{errors.bankDetails}</p>}
                    {formData.bankDetails?.map((bank, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 border border-gray-200 rounded relative">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                          <input
                            type="text"
                            placeholder="Account Number"
                            value={bank.accountNumber}
                            onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                          <select
                            value={bank.accountType}
                            onChange={(e) => handleBankDetailChange(index, 'accountType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select Account Type</option>
                            <option value="SAVINGS">Savings</option>
                            <option value="CURRENT">Current</option>
                          </select>
                          {(formData.bankDetails?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBankDetail(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                          <input
                            type="text"
                            placeholder="IFSC Code"
                            value={bank.ifscCode}
                            onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                          <input
                            type="text"
                            placeholder="Bank Name"
                            value={bank.bankName}
                            onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBankDetail}
                      className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <span className="mr-1">+</span> Add Another Bank Account
                    </button>
                  </div>
                </>
              ) : (
                /* Original Step 2 for non-seller registrations */
                <>
                  {formData.roles.includes('SELLER') && (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <HiOfficeBuilding className="w-5 h-5 mr-2" />
                        Seller Information
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input
                              type="text"
                              value={formData.businessName || ''}
                              onChange={(e) => handleInputChange('businessName', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Your Business Name"
                            />
                            {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">GST Number</label>
                            <input
                              type="text"
                              value={formData.gstNumber || ''}
                              onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="GST123456789"
                            />
                            {errors.gstNumber && <p className="mt-1 text-sm text-red-600">{errors.gstNumber}</p>}
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                            <HiPhone className="w-4 h-4 mr-2" />
                            Contact Information
                          </h4>
                          {formData.contacts?.map((contact, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <input
                                type="tel"
                                placeholder="Phone Number"
                                value={contact.phone}
                                onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                              <input
                                type="email"
                                placeholder="Contact Email"
                                value={contact.email}
                                onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                              <input
                                type="tel"
                                placeholder="Alternate Phone (Optional)"
                                value={contact.alternatePhone || ''}
                                onChange={(e) => handleContactChange(index, 'alternatePhone', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Address Information */}
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                            <HiLocationMarker className="w-4 h-4 mr-2" />
                            Business Address
                          </h4>
                          {formData.addresses?.map((address, index) => (
                            <div key={index} className="space-y-3 mb-4 p-3 border border-gray-200 rounded">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Address Line 1"
                                  value={address.addressLine1}
                                  onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Address Line 2 (Optional)"
                                  value={address.addressLine2 || ''}
                                  onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={address.city}
                                  onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={address.state}
                                  onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Country"
                                  value={address.country}
                                  onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                                <input
                                  type="text"
                                  placeholder="ZIP Code"
                                  value={address.zipCode}
                                  onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={address.isWarehouse || false}
                                  onChange={(e) => handleAddressChange(index, 'isWarehouse', e.target.checked)}
                                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">This is a warehouse address</label>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bank Details */}
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                            <HiCreditCard className="w-4 h-4 mr-2" />
                            Bank Details
                          </h4>
                          {formData.bankDetails?.map((bank, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <input
                                type="text"
                                placeholder="Account Number"
                                value={bank.accountNumber}
                                onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                              <select
                                value={bank.accountType}
                                onChange={(e) => handleBankDetailChange(index, 'accountType', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              >
                                <option value="">Select Account Type</option>
                                <option value="SAVINGS">Savings</option>
                                <option value="CURRENT">Current</option>
                              </select>
                              <input
                                type="text"
                                placeholder="IFSC Code"
                                value={bank.ifscCode}
                                onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                              <input
                                type="text"
                                placeholder="Bank Name"
                                value={bank.bankName}
                                onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.roles.includes('DELIVERY_PARTNER') && (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <HiTruck className="w-5 h-5 mr-2" />
                        Delivery Partner Information
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                              type="text"
                              value={formData.deliveryPartner?.fullName || ''}
                              onChange={(e) => handleDeliveryPartnerChange('fullName', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Full Name"
                            />
                            {errors.deliveryPartnerName && <p className="mt-1 text-sm text-red-600">{errors.deliveryPartnerName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                            <select
                              value={formData.deliveryPartner?.vehicleType || ''}
                              onChange={(e) => handleDeliveryPartnerChange('vehicleType', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                            >
                              <option value="">Select Vehicle Type</option>
                              <option value="BIKE">Bike</option>
                              <option value="SCOOTER">Scooter</option>
                              <option value="CAR">Car</option>
                              <option value="TRUCK">Truck</option>
                              <option value="VAN">Van</option>
                            </select>
                            {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                            <input
                              type="text"
                              value={formData.deliveryPartner?.vehicleNumber || ''}
                              onChange={(e) => handleDeliveryPartnerChange('vehicleNumber', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="MH01AB1234"
                            />
                            {errors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Documents & Review (Seller) or Review (Others) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {isSellerRegistration ? (
                <>
                  {/* Documents Section for Sellers */}
                  <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                    <h3 className="text-lg font-medium text-orange-900 mb-4 flex items-center">
                      <HiCreditCard className="w-5 h-5 mr-2" />
                      Required Documents
                    </h3>
                    <p className="text-sm text-orange-700 mb-4">
                      Please upload the following documents to complete your seller registration.
                    </p>

                    {formData.documents?.map((document, index) => (
                      <div key={index} className="space-y-3 mb-4 p-3 border border-orange-200 rounded bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-orange-800 mb-1">Document Type *</label>
                            <select
                              value={document.documentType}
                              onChange={(e) => handleDocumentChange(index, 'documentType', e.target.value)}
                              className="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="">Select Document Type</option>
                              <option value="GST_CERTIFICATE">GST Certificate</option>
                              <option value="PAN_CARD">PAN Card</option>
                              <option value="AADHAR_CARD">Aadhar Card</option>
                              <option value="BUSINESS_LICENSE">Business License</option>
                              <option value="BANK_STATEMENT">Bank Statement</option>
                              <option value="ADDRESS_PROOF">Address Proof</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-orange-800 mb-1">Document URL *</label>
                            <input
                              type="url"
                              placeholder="https://example.com/document.pdf"
                              value={document.documentUrl}
                              onChange={(e) => handleDocumentChange(index, 'documentUrl', e.target.value)}
                              className="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-orange-800 mb-1">Remarks (Optional)</label>
                          <input
                            type="text"
                            placeholder="Additional notes about this document"
                            value={document.remarks || ''}
                            onChange={(e) => handleDocumentChange(index, 'remarks', e.target.value)}
                            className="w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="text-sm text-orange-700">
                      <p><strong>Note:</strong> You can upload documents later from your seller dashboard, but providing them now will speed up your account verification.</p>
                    </div>
                  </div>

                  {/* Review Section */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Basic Information</h4>
                        <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                        <p><strong>Username:</strong> {formData.username}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Role:</strong> Seller</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Business Information</h4>
                        <p><strong>Business Name:</strong> {formData.businessName}</p>
                        <p><strong>GST Number:</strong> {formData.gstNumber}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Contacts</h4>
                        <p><strong>Contacts:</strong> {formData.contacts?.length || 0} contact(s) provided</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Addresses</h4>
                        <p><strong>Business Addresses:</strong> {formData.addresses?.length || 0} address(es) provided</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Bank Accounts</h4>
                        <p><strong>Bank Accounts:</strong> {formData.bankDetails?.length || 0} account(s) provided</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Documents</h4>
                        <p><strong>Documents:</strong> {formData.documents?.filter(d => d.documentType && d.documentUrl).length || 0} document(s) uploaded</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Review for non-seller registrations */
                <>
                  <h3 className="text-lg font-medium text-gray-900">Review Your Information</h3>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Basic Information</h4>
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Username:</strong> {formData.username}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Roles:</strong> {formData.roles.join(', ')}</p>
                  </div>

                  {formData.roles.includes('SELLER') && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Seller Information</h4>
                      <p><strong>Business Name:</strong> {formData.businessName}</p>
                      <p><strong>GST Number:</strong> {formData.gstNumber}</p>
                    </div>
                  )}

                  {formData.roles.includes('DELIVERY_PARTNER') && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Delivery Partner Information</h4>
                      <p><strong>Full Name:</strong> {formData.deliveryPartner?.fullName}</p>
                      <p><strong>Vehicle Type:</strong> {formData.deliveryPartner?.vehicleType}</p>
                      <p><strong>Vehicle Number:</strong> {formData.deliveryPartner?.vehicleNumber}</p>
                    </div>
                  )}
                </>
              )}

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handlePrevStep}
                  className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
