import React from 'react';
import { MdRefresh } from 'react-icons/md';

const BillingDetailsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
      
      {/* LEFT COLUMN: Guest Other Information */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 h-fit">
        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Guest Other Information</h2>
        
        <div className="space-y-3">
          {/* Nationality */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Nationality</label>
            <div className="col-span-9">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>Select</option>
                <option>Indian</option>
                <option>American</option>
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Gender</label>
            <div className="col-span-9">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Date of Birth</label>
            <div className="col-span-9">
               <input type="text" placeholder="DD/MM/YYYY" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm uppercase placeholder-gray-400" />
            </div>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Identity</label>
            <div className="col-span-4">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>Select</option>
                <option>Passport</option>
                <option>Driving License</option>
              </select>
            </div>
            <div className="col-span-5">
              <input type="text" placeholder="ID Number" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm placeholder-gray-400" />
            </div>
          </div>

          {/* VIP Checkbox */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">VIP</label>
            <div className="col-span-9">
              <input type="checkbox" className="h-4 w-4 border-gray-300 rounded" />
            </div>
          </div>

          {/* Notes */}
           <div className="grid grid-cols-12 gap-2">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium mt-2">Notes</label>
            <div className="col-span-9">
              <textarea className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm h-12 resize-none focus:outline-none focus:border-purple-500"></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Billing Information */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Billing Information</h2>
        
        <div className="space-y-3">
          {/* Billing Mode */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Billing Mode</label>
            <div className="col-span-9">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>Guest</option>
                <option>Company</option>
              </select>
            </div>
          </div>

          {/* Organisation */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Organisation</label>
            <div className="col-span-9 relative">
              <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm pr-8" />
              <MdRefresh className="absolute right-2 top-2 text-gray-500 cursor-pointer" />
            </div>
          </div>
          {/* Links under organisation */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3"></div>
            <div className="col-span-9 flex flex-col">
                <a href="#" className="text-xs text-blue-500 hover:underline">Create an Organisation ↗</a>
                <a href="#" className="text-xs text-blue-500 hover:underline">Copy Organisation Address To Address Fields ↗</a>
            </div>
          </div>

          {/* GST */}
           <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">GST</label>
            <div className="col-span-9">
              <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          {/* Business Source */}
           <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Business Source</label>
            <div className="col-span-9">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500">
                <option>Select</option>
              </select>
            </div>
          </div>

          {/* Market Segment */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Market Segment</label>
            <div className="col-span-9">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500">
                <option>Select</option>
              </select>
            </div>
          </div>

          {/* Booking Ref */}
           <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Booking Ref.</label>
            <div className="col-span-9">
              <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          {/* Travel Agent */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Travel Agent</label>
            <div className="col-span-9 relative">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500 appearance-none">
                <option>Select</option>
              </select>
               <MdRefresh className="absolute right-2 top-2 text-gray-500 cursor-pointer" />
            </div>
          </div>
           {/* Link under Travel Agent */}
           <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3"></div>
            <div className="col-span-9">
                <a href="#" className="text-xs text-blue-500 hover:underline">Create a Travel Agent ↗</a>
            </div>
          </div>

          {/* Room Charge */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Room Charge</label>
            <div className="col-span-9">
              <div className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-600">
                Room Charges
              </div>
            </div>
          </div>

        </div>
      </div>

       {/* Footer Buttons */}
       <div className="lg:col-span-2 flex justify-center space-x-4 mt-4">
          <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded shadow-md transition">
            Save
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-6 rounded shadow-md transition">
            Back To List
          </button>
      </div>

    </div>
  );
};

export default BillingDetailsSection;