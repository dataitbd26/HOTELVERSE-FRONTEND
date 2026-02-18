import React from 'react';
import { MdSearch } from 'react-icons/md';

const BanquetBookingDetails = () => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl text-gray-500 font-normal mb-6 border-b border-gray-100 pb-4">Create Banquet Booking</h2>
      <h3 className="text-lg font-bold text-gray-600 mb-4">Booking Details</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
        
        {/* LEFT COLUMN */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Rate Plan</label>
            <div className="col-span-8">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Banquet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Date</label>
            <div className="col-span-8">
              <input type="text" defaultValue="18/02/2026" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Status</label>
            <div className="col-span-8">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Pending Confirmation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Ledger</label>
            <div className="col-span-8">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Banquet Sales</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Note</label>
            <div className="col-span-8">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Net Amount</label>
            <div className="col-span-8">
              <input type="text" defaultValue="0" readOnly className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm text-right" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Round-Off Amount</label>
            <div className="col-span-8">
               <input type="text" defaultValue="0" readOnly className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm text-right" />
            </div>
          </div>

           <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Total Amount</label>
            <div className="col-span-8">
               <input type="text" defaultValue="0" readOnly className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm text-right" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-4 text-right text-sm font-semibold text-gray-600">Mode Of Payment</label>
            <div className="col-span-8">
              <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Select</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Room #</label>
            <div className="col-span-9">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Select</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Guest Name</label>
            <div className="col-span-9 relative">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
               <MdSearch className="absolute right-2 top-2 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Phone</label>
            <div className="col-span-3">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>+91</option>
              </select>
            </div>
            <div className="col-span-6">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

           <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Email</label>
            <div className="col-span-9">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

           {/* Address Block */}
          <div className="grid grid-cols-12 gap-2">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600 mt-2">Address</label>
            <div className="col-span-9 space-y-2">
               <input type="text" placeholder="Address 1" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
               <input type="text" placeholder="Address 2" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
               <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
                  <input type="text" placeholder="State" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
               </div>
               <input type="text" placeholder="Post Code" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Organisation</label>
            <div className="col-span-9">
               <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
                <option>Select</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">GST #</label>
            <div className="col-span-9">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-3 text-right text-sm font-semibold text-gray-600">PAN #</label>
            <div className="col-span-9">
               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BanquetBookingDetails;