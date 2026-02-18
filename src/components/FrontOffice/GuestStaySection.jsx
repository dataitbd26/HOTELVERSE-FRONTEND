import React from 'react';
import { MdSearch, MdAccessTime } from 'react-icons/md';

const GuestStaySection = () => {

    
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* LEFT COLUMN: Guest Information */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold text-gray-700">Guest Information</h2>
          <div className="space-x-2">
            <button className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600 transition">
              Create Guest
            </button>
            <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition">
              Search Guest
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Guest Name */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Guest Name</label>
            <div className="col-span-2">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500">
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
              </select>
            </div>
            <div className="col-span-7 relative">
              <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500" />
              <MdSearch className="absolute right-2 top-2 text-blue-400 text-lg" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Phone Number</label>
            <div className="col-span-2">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>+91</option>
                <option>+1</option>
              </select>
            </div>
            <div className="col-span-7">
              <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Email</label>
            <div className="col-span-9">
              <input type="email" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Country */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Country</label>
            <div className="col-span-9">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-12 gap-2">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium mt-2">Address</label>
            <div className="col-span-9 space-y-2">
              <input type="text" placeholder="Address 1" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500" />
              <input type="text" placeholder="Address 2" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500" />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="City" className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500" />
                <input type="text" placeholder="State" className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500" />
                <input type="text" placeholder="Post Code" className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Stay Information */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Stay Information</h2>
        <div className="space-y-3">
          
          {/* Arrival */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Arrival</label>
            <div className="col-span-6">
              <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm uppercase text-gray-400" />
            </div>
            <div className="col-span-3 flex items-center border border-gray-300 rounded px-2 py-1.5">
               <input type="text" defaultValue="12:00 PM" className="w-full text-xs outline-none" />
               <MdAccessTime className="text-gray-400" />
            </div>
          </div>

          {/* Departure */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Departure</label>
            <div className="col-span-6">
              <input type="date" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm uppercase text-gray-400" />
            </div>
             <div className="col-span-3 flex items-center border border-gray-300 rounded px-2 py-1.5">
               <input type="text" defaultValue="12:00 PM" className="w-full text-xs outline-none" />
               <MdAccessTime className="text-gray-400" />
            </div>
          </div>

          {/* Nights */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Nights</label>
            <div className="col-span-9">
              <input type="text" defaultValue="0" readOnly className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Rooms</label>
            <div className="col-span-9">
              <input type="number" defaultValue="1" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium">Status</label>
            <div className="col-span-9">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Notes */}
           <div className="grid grid-cols-12 gap-2">
            <label className="col-span-3 text-right text-sm text-gray-600 font-medium mt-2">Notes</label>
            <div className="col-span-9">
              <textarea className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm h-16 resize-none focus:outline-none focus:border-purple-500"></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuestStaySection;