import React from 'react';
import BanquetBookingDetails from '../../components/Bandquet/BanquetBookingDetails';
import BanquetEvents from '../../components/Bandquet/BanquetEvents';
import BanquetReceipts from '../../components/Bandquet/BanquetReceipts';

const NewBooking = () => {

    return (
         <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Components Stack */}
        <BanquetBookingDetails />
        <BanquetEvents />
        <BanquetReceipts />

        {/* Bottom Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pb-8">
           <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded shadow-md transition">
            Save
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-8 rounded shadow-md transition">
            Back To List
          </button>
        </div>

      </div>
    </div>
    );
};

export default NewBooking;







  

