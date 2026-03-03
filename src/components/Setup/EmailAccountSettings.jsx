import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const EmailAccountSettings = () => {
  // State to store all form data
  const [formData, setFormData] = useState({
    email: 'exceedsoftwaresolutions@gmail.com',
    displayName: 'Demo Hotel',
    host: 'smtp.gmail.com',
    port: '587',
    username: 'exceedsoftwaresolutions@gmail.com',
    password: '',
    ssl: true,
    useDefaultCredentials: false,
    adminEmail: '',
    active: true,
    testEmail: '' // For the test email field
  });

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  // State to track validation errors
  const [errors, setErrors] = useState({});

  // Dynamic input change handler using name-value approach
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Dynamic checkbox change handler
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Display Name validation
    if (!formData.displayName) {
      newErrors.displayName = 'Display Name is required';
    }

    // Host validation
    if (!formData.host) {
      newErrors.host = 'SMTP Server is required';
    }

    // Port validation
    if (!formData.port) {
      newErrors.port = 'Port is required';
    } else if (!/^\d+$/.test(formData.port)) {
      newErrors.port = 'Port must be a number';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    // Password validation (only if not using default credentials)
    if (!formData.useDefaultCredentials && !formData.password) {
      newErrors.password = 'Password is required';
    }

    // Admin Email validation (if provided)
    if (formData.adminEmail && !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Admin Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate test email
  const validateTestEmail = () => {
    if (!formData.testEmail) {
      toast.error('Please enter an email address');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.testEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // POST data to backend
  const postData = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/email-settings', data);
      toast.success('Email account settings saved successfully!');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving email settings:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || 'Failed to save email settings');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // GET data from backend (if you need to fetch existing settings)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/email-settings');
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Failed to fetch email settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove testEmail from the data before sending to backend
      const { testEmail, ...dataToSend } = formData;
      await postData(dataToSend);
    } else {
      console.log('Form validation failed:', errors);
      toast.error("Please fill up all required fields.");
    }
  };

  // Handle test email submission
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    
    if (validateTestEmail()) {
      setIsLoading(true);
      try {
        // Send test email request
        const response = await axios.post('http://localhost:8080/post', {
          testEmail: formData.testEmail,
          settings: formData
        });
        toast.success(`Test email sent to ${formData.testEmail}!`);
        console.log('Test email response:', response.data);
      } catch (error) {
        console.error('Error sending test email:', error);
        toast.error('Failed to send test email. Please check your settings.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fetch existing settings when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-gray-100 mb-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-xl text-gray-500 mb-6 font-normal">Email Account</h2>
      
      {/* Grid: 1 column on mobile/tablet, 2 columns on large laptops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* LEFT SECTION: Detail Form */}
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-bold text-gray-600 mb-4">Detail</h3>
          <hr className="mb-6 border-gray-200" />
          
          <div className="space-y-4">
            {/* Reusable Form Row Component for consistency */}
            <FormRow 
              label="Email" 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Display Name" 
              type="text" 
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              error={errors.displayName}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Host (SMTP Server)" 
              type="text" 
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              error={errors.host}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Port" 
              type="text" 
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              error={errors.port}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Username" 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Password" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              disabled={isLoading}
            />

            {/* Checkboxes */}
            <CheckboxRow 
              label="SSL" 
              name="ssl"
              checked={formData.ssl}
              onChange={handleCheckboxChange}
              disabled={isLoading}
            />
            
            <CheckboxRow 
              label="Use Default Credentials" 
              name="useDefaultCredentials"
              checked={formData.useDefaultCredentials}
              onChange={handleCheckboxChange}
              disabled={isLoading}
            />
            
            <FormRow 
              label="Admin's Email (optional)" 
              type="email" 
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              error={errors.adminEmail}
              disabled={isLoading}
            />
            
            <CheckboxRow 
              label="Active" 
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
              disabled={isLoading}
            />

            {/* Save Button */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
              <div className="hidden md:block md:col-span-4"></div>
              <div className="col-span-1 md:col-span-8">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full md:w-auto ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition`}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* RIGHT SECTION: Send Test Email */}
        <div>
          <h3 className="text-lg font-bold text-gray-600 mb-4">Send Test Email</h3>
          <hr className="mb-6 border-gray-200" />
          
          <div className="space-y-4">
            <p className="text-red-500 text-xs mb-4">
              Send test email will only work once the details have been saved.
            </p>

            <FormRow 
              label="Email" 
              type="email" 
              name="testEmail"
              value={formData.testEmail}
              onChange={handleInputChange}
              placeholder="Enter test email address"
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
              <div className="hidden md:block md:col-span-2"></div>
              <div className="col-span-1 md:col-span-10">
                <button 
                  onClick={handleSendTestEmail}
                  disabled={isLoading}
                  className={`w-full md:w-auto ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition`}
                >
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Inputs
const FormRow = ({ label, type, name, value, onChange, error, placeholder, disabled }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center">
    <label className="col-span-1 md:col-span-4 text-left md:text-right text-sm font-semibold text-gray-600">
      {label}
    </label>
    <div className="col-span-1 md:col-span-8">
      <input 
        type={type} 
        name={name}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700 ${disabled ? 'bg-gray-100' : ''}`} 
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  </div>
);

// Helper Component for Checkboxes
const CheckboxRow = ({ label, name, checked, onChange, disabled }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
    <label className="col-span-1 md:col-span-4 text-left md:text-right text-sm font-semibold text-gray-600">
      {label}
    </label>
    <div className="col-span-1 md:col-span-8">
      <input 
        type="checkbox" 
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500" 
      />
    </div>
  </div>
);

export default EmailAccountSettings;