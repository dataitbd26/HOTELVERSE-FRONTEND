import React from 'react';
import GuestStaySection from '../../components/FrontOffice/GuestStaySection';
import BillingDetailsSection from '../../components/FrontOffice/BillingDetailsSection';
import { MdDateRange, MdPeople } from 'react-icons/md';

const WalkIn = () => {

    return (
          <>
    <div className="flex flex-col md:flex-row justify-between items-center mb-6  pt-2">
      <h1 className="text-2xl font-normal text-gray-500">Walk-In</h1>
      <div className="space-x-2 mt-4 md:mt-0">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow-sm font-medium transition">
          Save
        </button>
        <button className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded shadow-sm font-medium transition">
          Back To Reservation List
        </button>
      </div>
    </div>



        {/* main 2 component here */}
        <div className="p-4 bg-[#ffffff] rounded-md min-h-screen">
      
      {/* Top Tabs */}
      <div className="flex space-x-2 mb-4">
        <button className="flex items-center space-x-1 bg-purple-600 text-white px-4 py-2 rounded-md shadow text-sm font-medium">
       <span className="w-4 h-4 flex items-center justify-center border-2 border-white rounded-full text-sm">
  i
</span>

          <span>Information</span>
        </button>
        
        <button className="flex items-center space-x-1 bg-gray-200 text-gray-600 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 text-sm font-medium">
           <MdDateRange />
          <span>Rooms</span>
        </button>
         <button className="flex items-center space-x-1 bg-gray-200 text-gray-600 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 text-sm font-medium">
           <MdPeople />
          <span>Guests</span>
        </button>
      </div>



      {/* Main Form Components */}
      <GuestStaySection />
      <BillingDetailsSection />

    </div>


    </>
    );
};

export default WalkIn;