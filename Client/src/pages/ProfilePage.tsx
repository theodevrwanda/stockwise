import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User as UserIcon,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  RefreshCcw,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  branch: string;
  role: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastUpdated: string;
  profileImage: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface EditableProfileFields {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  profileImage: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface ReportSettings {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  branches: string[];
  productStatuses: ('store' | 'sold' | 'restored' | 'deleted')[];
  recipientEmails: string[];
}

interface Branch {
  id: string;
  branchName: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const assignedBranch = user?.branch || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [displayedSellerData, setDisplayedSellerData] = useState<Seller | null>(null);
  const [formData, setFormData] = useState<EditableProfileFields>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    profileImage: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
  });
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    frequency: 'daily',
    time: '08:00',
    branches: isAdmin ? [] : (typeof assignedBranch === 'string' ? [assignedBranch] : []),
    productStatuses: [],
    recipientEmails: [],
  });
  const [newEmail, setNewEmail] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  const productStatuses: ('store' | 'sold' | 'restored' | 'deleted')[] = [
    'store',
    'sold',
    'restored',
    'deleted',
  ];

  // Axios interceptors for token handling
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await auth.currentUser?.getIdToken(true);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [toast]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        toast({
          title: 'Error',
          description: 'You are not logged in. Please log in again.',
          variant: 'destructive',
        });
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const initializeFormData = useCallback((sellerData: Seller) => {
    setFormData({
      firstName: sellerData.firstName,
      lastName: sellerData.lastName,
      username: sellerData.username,
      email: sellerData.email,
      phone: sellerData.phone,
      profileImage: sellerData.profileImage,
      district: sellerData.district,
      sector: sellerData.sector,
      cell: sellerData.cell,
      village: sellerData.village,
    });
    setPreviewImage(sellerData.profileImage);
    setSelectedFile(null);
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/profile/branches');
      setBranches(response.data);
      if (!response.data.length) {
        toast({
          title: 'No Branches',
          description: 'No branches found in the database.',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch branches. Please try again.',
        variant: 'destructive',
      });
      setBranches([]);
    }
  }, [toast]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/profile');
      const userData: Seller = {
        id: response.data._id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        branch: response.data.branch || 'No branch assigned',
        role: response.data.role,
        status: response.data.isActive ? 'active' : 'inactive',
        joinedDate: response.data.createdAt,
        lastUpdated: response.data.updatedAt,
        profileImage: response.data.imagephoto,
        district: response.data.district,
        sector: response.data.sector,
        cell: response.data.cell,
        village: response.data.village,
      };
      setDisplayedSellerData(userData);
      initializeFormData(userData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user data. Please try again.',
        variant: 'destructive',
      });
      setDisplayedSellerData(null);
    }
  }, [initializeFormData, toast]);

  const fetchReportSettings = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/profile/reports');
      setReportSettings({
        ...response.data,
        branches: response.data.branches.map((branch: any) => branch.branchName || branch),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch report settings. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchReportSettings(),
          isAdmin ? fetchBranches() : Promise.resolve(),
        ]);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load initial data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchUserData, fetchReportSettings, fetchBranches, isAdmin, toast]);

  useEffect(() => {
    if (displayedSellerData && !isEditing) {
      initializeFormData(displayedSellerData);
    }
  }, [displayedSellerData, isEditing, initializeFormData]);

  const handleInputChange = (field: keyof EditableProfileFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        toast({
          title: 'Profile Image Selected',
          description: 'New image ready to be saved.',
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(displayedSellerData?.profileImage || '');
    }
  };

  const handleSave = async () => {
    if (!displayedSellerData) {
      toast({
        title: 'Save Not Allowed',
        description: 'No profile data loaded. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.phone || !formData.district || !formData.sector || !formData.cell || !formData.village) {
      toast({
        title: 'Validation Error',
        description: 'All fields (except image) are required.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('sector', formData.sector);
      formDataToSend.append('cell', formData.cell);
      formDataToSend.append('village', formData.village);
      if (selectedFile) {
        formDataToSend.append('imagephoto', selectedFile);
      }

      const response = await axiosInstance.put('/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedSeller: Seller = {
        id: response.data._id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        branch: response.data.branch || 'No branch assigned',
        role: response.data.role,
        status: response.data.isActive ? 'active' : 'inactive',
        joinedDate: response.data.createdAt,
        lastUpdated: response.data.updatedAt,
        profileImage: response.data.imagephoto,
        district: response.data.district,
        sector: response.data.sector,
        cell: response.data.cell,
        village: response.data.village,
      };
      setDisplayedSellerData(updatedSeller);
      initializeFormData(updatedSeller);
      setIsEditing(false);
      setSelectedFile(null);
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (displayedSellerData) {
      initializeFormData(displayedSellerData);
    }
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    Promise.all([
      fetchUserData(),
      fetchReportSettings(),
      isAdmin ? fetchBranches() : Promise.resolve(),
    ])
      .then(() => {
        toast({
          title: 'Profile Data Refreshed',
          description: 'Your profile information has been reloaded.',
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to refresh data. Please try again.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSettingsChange = (
    field: keyof ReportSettings,
    value: string | string[]
  ) => {
    setReportSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      if (reportSettings.recipientEmails.includes(newEmail)) {
        toast({
          title: 'Duplicate Email',
          description: 'This email is already added.',
          variant: 'destructive',
        });
        return;
      }
      setReportSettings((prev) => ({
        ...prev,
        recipientEmails: [...prev.recipientEmails, newEmail],
      }));
      setNewEmail('');
    } else {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveEmail = (email: string) => {
    setReportSettings((prev) => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter((e) => e !== email),
    }));
  };

  const handleAddBranch = () => {
    if (!isAdmin) {
      toast({
        title: 'Permission Error',
        description: 'Only admin can add branches to report settings.',
        variant: 'destructive',
      });
      return;
    }
    if (!newBranch) {
      toast({
        title: 'No Branch Selected',
        description: 'Please select a branch to add.',
        variant: 'destructive',
      });
      return;
    }
    if (reportSettings.branches.includes(newBranch)) {
      toast({
        title: 'Duplicate Branch',
        description: 'This branch is already added.',
        variant: 'destructive',
      });
      return;
    }
    setReportSettings((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
    setNewBranch('');
  };

  const handleRemoveBranch = (branch: string) => {
    if (!isAdmin) {
      toast({
        title: 'Permission Error',
        description: 'Only admin can remove branches from report settings.',
        variant: 'destructive',
      });
      return;
    }
    setReportSettings((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b !== branch),
    }));
  };

  const handleAddStatus = () => {
    if (!newStatus) {
      toast({
        title: 'No Status Selected',
        description: 'Please select a status to add.',
        variant: 'destructive',
      });
      return;
    }
    if (reportSettings.productStatuses.includes(newStatus as any)) {
      toast({
        title: 'Duplicate Status',
        description: 'This status is already added.',
        variant: 'destructive',
      });
      return;
    }
    setReportSettings((prev) => ({
      ...prev,
      productStatuses: [...prev.productStatuses, newStatus as any],
    }));
    setNewStatus('');
  };

  const handleRemoveStatus = (status: string) => {
    setReportSettings((prev) => ({
      ...prev,
      productStatuses: prev.productStatuses.filter((s) => s !== status),
    }));
  };

  const handleSaveSettings = async () => {
    if (reportSettings.branches.length === 0) {
      toast({
        title: 'Invalid Settings',
        description: 'Please select at least one branch.',
        variant: 'destructive',
      });
      return;
    }
    if (reportSettings.productStatuses.length === 0) {
      toast({
        title: 'Invalid Settings',
        description: 'Please select at least one product status.',
        variant: 'destructive',
      });
      return;
    }
    if (reportSettings.recipientEmails.length === 0) {
      toast({
        title: 'Invalid Settings',
        description: 'Please add at least one recipient email.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingSettings(true);
    try {
      // Map branch names to IDs for API
      const branchIds = reportSettings.branches.map((branchName) => {
        const branch = branches.find((b) => b.branchName === branchName);
        return branch?.id || branchName;
      });
      const response = await axiosInstance.put('/profile/reports', {
        frequency: reportSettings.frequency,
        time: reportSettings.time,
        branches: branchIds,
        productStatuses: reportSettings.productStatuses,
        recipientEmails: reportSettings.recipientEmails,
        isActive: true,
      });
      setReportSettings({
        ...response.data,
        branches: response.data.branches.map((branch: any) => branch.branchName || branch),
      });
      toast({
        title: 'Settings Saved',
        description: 'Automated report settings have been updated.',
      });
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      staff: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    };
    return (
      <Badge
        className={`capitalize ${
          roleColors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          Inactive
        </Badge>
      );
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your seller account information</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || isSaving || isSavingSettings}
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSaving || isLoading || isSavingSettings}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={isSaving || isLoading || isSavingSettings}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </>
          )}
          <Button
            onClick={handleRefreshData}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isSaving || isLoading || isSavingSettings}
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Seller Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden bg-gray-300 dark:bg-gray-600 hover:opacity-80 transition-opacity"
                onClick={handleImageClick}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-gray-600 dark:text-gray-400" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Edit size={24} className="text-white" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  disabled={!isEditing || isSaving || isLoading || isSavingSettings}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {displayedSellerData?.firstName} {displayedSellerData?.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{displayedSellerData?.username}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getRoleBadge(displayedSellerData?.role || '')}
                  {getStatusBadge(displayedSellerData?.status || 'inactive')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <UserIcon size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.firstName || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <UserIcon size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.lastName || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <UserIcon size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.username || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <Mail size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.email || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <Phone size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.phone || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                {isEditing ? (
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.district || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                {isEditing ? (
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.sector || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cell">Cell</Label>
                {isEditing ? (
                  <Input
                    id="cell"
                    value={formData.cell}
                    onChange={(e) => handleInputChange('cell', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.cell || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                {isEditing ? (
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    disabled={isSaving || isLoading || isSavingSettings}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{displayedSellerData?.village || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Joined Date</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                  <Calendar size={16} className="text-gray-500" />
                  <span>{formatDate(displayedSellerData?.joinedDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                  <Calendar size={16} className="text-gray-500" />
                  <span>{formatDate(displayedSellerData?.lastUpdated)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Seller Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Role</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getRoleBadge(displayedSellerData?.role || '')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Status</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getStatusBadge(displayedSellerData?.status || 'inactive')}
                </span>
              </div>
            </CardContent>
          </Card>

          {(isAdmin || isStaff) && (
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Automated Report Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportFrequency">Report Frequency</Label>
                  <Select
                    value={reportSettings.frequency}
                    onValueChange={(value) => handleSettingsChange('frequency', value)}
                    disabled={isSavingSettings || isLoading || isSaving}
                  >
                    <SelectTrigger id="reportFrequency" className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportTime">Report Time</Label>
                  <Input
                    id="reportTime"
                    type="time"
                    value={reportSettings.time}
                    onChange={(e) => handleSettingsChange('time', e.target.value)}
                    disabled={isSavingSettings || isLoading || isSaving}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Branches to Include</Label>
                  {isAdmin ? (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={newBranch}
                        onValueChange={setNewBranch}
                        disabled={isSavingSettings || isLoading || isSaving}
                      >
                        <SelectTrigger id="branches" className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.branchName}>
                              {branch.branchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddBranch}
                        disabled={isSavingSettings || !newBranch || isLoading || isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                      <MapPin size={16} className="text-gray-500" />
                      <span>{typeof assignedBranch === 'string' ? assignedBranch : (assignedBranch?.name || 'No branch assigned')}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportSettings.branches.map((branch) => (
                      <Badge
                        key={branch}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <span>{branch}</span>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBranch(branch)}
                            disabled={isSavingSettings || isLoading || isSaving}
                            className="p-0 h-auto"
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Statuses to Include</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={newStatus}
                      onValueChange={setNewStatus}
                      disabled={isSavingSettings || isLoading || isSaving}
                    >
                      <SelectTrigger id="statuses" className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {productStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAddStatus}
                      disabled={isSavingSettings || !newStatus || isLoading || isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportSettings.productStatuses.map((status) => (
                      <Badge
                        key={status}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStatus(status)}
                          disabled={isSavingSettings || isLoading || isSaving}
                          className="p-0 h-auto"
                        >
                          <X size={14} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmails">Recipient Emails</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="recipientEmails"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Add email address"
                      disabled={isSavingSettings || isLoading || isSaving}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    <Button
                      onClick={handleAddEmail}
                      disabled={isSavingSettings || isLoading || isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportSettings.recipientEmails.map((email) => (
                      <Badge
                        key={email}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <span>{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(email)}
                          disabled={isSavingSettings || isLoading || isSaving}
                          className="p-0 h-auto"
                        >
                          <X size={14} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSavingSettings || isLoading || isSaving}
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Save Report Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;