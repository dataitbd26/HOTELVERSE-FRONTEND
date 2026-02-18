import React from 'react';

const EmailAccountSettings = () => {
    
  return (
 
    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl text-gray-500 mb-6 font-normal">Email Account</h2>
      
      {/* Grid: 1 column on mobile/tablet, 2 columns on large laptops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* LEFT SECTION: Detail Form */}
        <div>
          <h3 className="text-lg font-bold text-gray-600 mb-4">Detail</h3>
          <hr className="mb-6 border-gray-200" />
          
          <div className="space-y-4">
            {/* Reusable Form Row Component for consistency */}
            <FormRow label="Email" type="email" defaultValue="exceedsoftwaresolutions@gmail.com" />
            <FormRow label="Display Name" type="text" defaultValue="Demo Hotel" />
            <FormRow label="Host (SMTP Server)" type="text" defaultValue="smtp.gmail.com" />
            <FormRow label="Port" type="text" defaultValue="587" />
            <FormRow label="Username" type="text" defaultValue="exceedsoftwaresolutions@gmail.com" />
            <FormRow label="Password" type="password" />

            {/* Checkboxes */}
            <CheckboxRow label="SSL" defaultChecked={true} />
            <CheckboxRow label="Use Default Credentials" defaultChecked={false} />
            
            <FormRow label="Admin's Email (optional)" type="email" />
            
            <CheckboxRow label="Active" defaultChecked={true} />

            {/* Save Button */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
               <div className="hidden md:block md:col-span-4"></div>
               <div className="col-span-1 md:col-span-8">
                  <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition">
                    Save
                  </button>
               </div>
            </div>

          </div>
        </div>

        {/* RIGHT SECTION: Send Test Email */}
        <div>
          <h3 className="text-lg font-bold text-gray-600 mb-4">Send Test Email</h3>
          <hr className="mb-6 border-gray-200" />
          
          <div className="space-y-4">
             <p className="text-red-500 text-xs mb-4">
               Send test email will only work once the details have been saved.
             </p>

             <FormRow label="Email" type="email" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
               <div className="hidden md:block md:col-span-2"></div>
               <div className="col-span-1 md:col-span-10">
                  <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-6 rounded shadow-sm transition">
                    Send Test Email
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
// Responsive logic: 
// - Mobile: Label takes full width (text-left). Input takes full width.
// - Tablet/Desktop (md+): Label takes 4 cols (text-right). Input takes 8 cols.
const FormRow = ({ label, type, defaultValue }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center">
    <label className="col-span-1 md:col-span-4 text-left md:text-right text-sm font-semibold text-gray-600">
      {label}
    </label>
    <div className="col-span-1 md:col-span-8">
      <input 
        type={type} 
        defaultValue={defaultValue} 
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700" 
      />
    </div>
  </div>
);

// Helper Component for Checkboxes
const CheckboxRow = ({ label, defaultChecked }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
    <label className="col-span-1 md:col-span-4 text-left md:text-right text-sm font-semibold text-gray-600">
      {label}
    </label>
    <div className="col-span-1 md:col-span-8">
      <input 
        type="checkbox" 
        defaultChecked={defaultChecked} 
        className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500" 
      />
    </div>
  </div>
);



export default EmailAccountSettings;