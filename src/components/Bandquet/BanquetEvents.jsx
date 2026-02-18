import React from 'react';
import { MdAccessTime, MdDelete, MdExpandLess } from 'react-icons/md';

const BanquetEvents = () => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 mb-6">
      
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h2 className="text-xl text-gray-600 font-bold">Events</h2>
           <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium">Collapse All Events</button>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded font-medium shadow-sm transition">
          Add Event
        </button>
      </div>

      {/* Event Card Container */}
      <div className="border border-gray-200 rounded-md bg-gray-50">
        
        {/* Card Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-200 rounded-t-md">
           <span className="font-semibold text-sm text-gray-700">Event - 1</span>
           <div className="flex gap-3 text-gray-600">
             <MdDelete className="cursor-pointer text-red-500 hover:text-red-600 text-lg" />
             <MdExpandLess className="cursor-pointer text-black text-lg bg-white rounded-full p-0.5" />
           </div>
        </div>

        {/* Card Body */}
        <div className="p-4 bg-white rounded-b-md">
          
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded w-full">
            <button className="flex-1 bg-purple-600 text-white py-1.5 text-sm font-medium rounded shadow-sm">Event Detail</button>
            <button className="flex-1 bg-gray-200 text-gray-500 py-1.5 text-sm font-medium rounded hover:bg-gray-300">Event Items</button>
            <button className="flex-1 bg-gray-200 text-gray-500 py-1.5 text-sm font-medium rounded hover:bg-gray-300">Event Menu</button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
            
            {/* Left Column */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Name</label>
                <div className="col-span-7">
                  <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"><option>Select</option></select>
                </div>
              </div>
               <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Meal</label>
                <div className="col-span-7">
                  <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"><option>Select</option></select>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Banquet</label>
                <div className="col-span-7">
                  <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"><option>Select</option></select>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Seating Arrangement</label>
                <div className="col-span-7">
                  <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"><option>Select</option></select>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Exp. Number of Persons to Billed</label>
                <div className="col-span-5">
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-5 text-right text-sm font-semibold text-gray-600">Actual Number of Persons to Billed</label>
                <div className="col-span-5">
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Date From + Time */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Date From</label>
                <div className="col-span-5">
                   <input type="text" defaultValue="18/02/2026" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="col-span-4 flex items-center border border-gray-300 rounded px-2 bg-white">
                    <input type="text" defaultValue="4:15 PM" className="w-full py-1.5 text-sm outline-none" />
                    <MdAccessTime className="text-gray-500" />
                </div>
              </div>

               {/* Date To + Time */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-3 text-right text-sm font-semibold text-gray-600">Date To</label>
                <div className="col-span-5">
                   <input type="text" placeholder="DD/MM/YYYY" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-400" />
                </div>
                <div className="col-span-4 flex items-center border border-gray-300 rounded px-2 bg-white">
                    <input type="text" defaultValue="4:15 PM" className="w-full py-1.5 text-sm outline-none" />
                    <MdAccessTime className="text-gray-500" />
                </div>
              </div>

              {/* Check Availability Link */}
              <div className="text-right">
                <a href="#" className="text-red-500 text-xs hover:underline">Check Availability</a>
              </div>

               {/* Event Message */}
              <div className="grid grid-cols-12 gap-2">
                <label className="col-span-3 text-right text-sm font-semibold text-gray-600 mt-2">Event Message</label>
                <div className="col-span-9">
                  <textarea className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm h-12 resize-none"></textarea>
                </div>
              </div>

               {/* Note */}
              <div className="grid grid-cols-12 gap-2">
                <label className="col-span-3 text-right text-sm font-semibold text-gray-600 mt-2">Note</label>
                <div className="col-span-9">
                  <textarea className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm h-12 resize-none"></textarea>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BanquetEvents;