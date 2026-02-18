import React from 'react';

const GuestProfiles = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl text-gray-500 font-normal">Guest Profiles</h1>
        <button className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded shadow-sm transition">
          Create
        </button>
      </div>

      {/* --- Search Filter Section --- */}
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col xl:flex-row gap-6 items-end">
          
          {/* Input Group */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700" 
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Mobile</label>
              <input 
                type="text" 
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700" 
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <input 
                type="text" 
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700" 
              />
            </div>

            {/* ID No. */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">ID No.</label>
              <input 
                type="text" 
                className="w-full border border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-blue-500 text-gray-700" 
              />
            </div>
          </div>

          {/* Actions Group (Checkbox + Search) */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
             {/* Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-600">Show Only Inactive</span>
            </label>

            {/* Search Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-6 rounded shadow-sm transition text-sm">
              Search
            </button>
          </div>

        </div>
      </div>

      {/* --- Results Area (Placeholder) --- */}
      <div className="bg-white p-12 rounded-md shadow-sm border border-gray-100 flex justify-center items-center min-h-[200px]">
        <span className="text-gray-800 font-medium text-sm">
          Please search by filling the guest details
        </span>
      </div>

    </div>
  );
};

export default GuestProfiles;