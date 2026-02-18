import React from 'react';
import { MdClose, MdSearch, MdPerson, MdPhone, MdHotel, MdCalendarToday } from 'react-icons/md';

const GuestSelfServices = () => {
  // Mock data
  const bookings = [
    {
      id: "004926",
      status: "Arrived",
      guestName: "Mr. Sanando Chakroborty",
      phone: "+91-8902234234",
      rooms: 1,
      toArrive: 0,
      arrivalDate: "20-Feb",
      arrivalTime: "12:00 PM",
      departureDate: "24-Feb",
      departureTime: "12:00 PM",
      sent: false,
      submitted: false,
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-sans">
      
      {/* --- Page Header --- */}
      <h1 className="text-2xl text-gray-500 font-normal mb-6">Guest Self Services</h1>

      {/* --- Search Filters (Responsive) --- */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-48">
          <input 
            type="text" 
            defaultValue="18/02/2026"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-blue-500" 
          />
        </div>
        <div className="w-full md:w-64">
           <input 
            type="text" 
            placeholder="Guest Name" 
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400 focus:outline-blue-500" 
          />
        </div>
        <div className="w-full md:w-auto">
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2">
             <MdSearch className="text-lg" /> Search
          </button>
        </div>
      </div>

      {/* --- GROUP HEADER (Visible on both views) --- */}
      {/* We pull this out of the table to make it responsive easier */}
      <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-t-md flex flex-col sm:flex-row justify-between items-center text-cyan-900 mt-6">
         <span className="font-bold text-sm md:text-base">Upcoming Self Checkins (Next 3 Days)</span>
         <span className="text-xs md:text-sm font-semibold mt-1 sm:mt-0">1 Bookings | 0 Rooms To Arrive</span>
      </div>

      {/* ==============================================
          1. DESKTOP VIEW: Full Table
          Hidden on Mobile (hidden), Block on Desktop (md:block)
      =============================================== */}
      <div className="hidden md:block bg-white border border-t-0 border-gray-200 rounded-b-md shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Reserve #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Phone #</th>
                <th className="px-4 py-3 text-center">Rooms</th>
                <th className="px-4 py-3 text-center">To Arrive</th>
                <th className="px-4 py-3">Arrival</th>
                <th className="px-4 py-3">Departure</th>
                <th className="px-4 py-3 text-center">Sent</th>
                <th className="px-4 py-3 text-center">Submitted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-700">{booking.id}</td>
                  <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                  <td className="px-4 py-3 font-medium text-gray-800">{booking.guestName}</td>
                  <td className="px-4 py-3 text-gray-500">{booking.phone}</td>
                  <td className="px-4 py-3 text-center text-blue-600 font-bold">{booking.rooms}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{booking.toArrive}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="font-semibold">{booking.arrivalDate}</div>
                    <div>{booking.arrivalTime}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="font-semibold">{booking.departureDate}</div>
                    <div>{booking.departureTime}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{!booking.sent && <MdClose className="text-red-500 inline text-lg" />}</td>
                  <td className="px-4 py-3 text-center">{!booking.submitted && <MdClose className="text-red-500 inline text-lg" />}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition">
                      Send Self Checkin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      {/* ==============================================
          2. MOBILE VIEW: Card Layout
          Block on Mobile, Hidden on Desktop (md:hidden)
      =============================================== */}
      <div className="md:hidden space-y-4 border border-t-0 border-gray-200 p-4 bg-white rounded-b-md">
        {bookings.map((booking, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
            
            {/* Row 1: ID and Status */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div>
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Reserve #</span>
                <span className="font-bold text-gray-700 text-lg">{booking.id}</span>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Row 2: Guest Details */}
            <div className="grid grid-cols-1 gap-2">
               <div className="flex items-center text-gray-800 text-sm font-bold">
                   <MdPerson className="mr-2 text-blue-500 text-lg" /> {booking.guestName}
               </div>
               <div className="flex items-center text-gray-600 text-sm pl-7">
                   {booking.phone}
               </div>
            </div>

            {/* Row 3: Room & Arrival Stats Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-md mt-1">
              {/* Arrival */}
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Arrival</span>
                <div className="text-sm font-semibold text-gray-700">{booking.arrivalDate}</div>
                <div className="text-xs text-gray-500">{booking.arrivalTime}</div>
              </div>
              {/* Departure */}
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Departure</span>
                <div className="text-sm font-semibold text-gray-700">{booking.departureDate}</div>
                <div className="text-xs text-gray-500">{booking.departureTime}</div>
              </div>
              {/* Rooms */}
               <div className="flex items-center gap-1 mt-2">
                 <MdHotel className="text-gray-400" /> 
                 <span className="text-xs text-gray-500">Rooms: <b className="text-blue-600">{booking.rooms}</b></span>
               </div>
               {/* To Arrive */}
               <div className="flex items-center gap-1 mt-2">
                 <span className="text-xs text-gray-500">To Arrive: <b>{booking.toArrive}</b></span>
               </div>
            </div>

            {/* Row 4: Status Icons & Action Button */}
            <div className="flex flex-col gap-3 pt-2">
               <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>Sent: {!booking.sent ? <span className="text-red-500 font-bold">No</span> : "Yes"}</span>
                  <span>Submitted: {!booking.submitted ? <span className="text-red-500 font-bold">No</span> : "Yes"}</span>
               </div>
               
               <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md shadow-sm font-medium transition text-sm">
                  Send Self Checkin
               </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

// Helper for Status Badge to ensure consistency across views
const StatusBadge = ({ status }) => (
  <span className={`${status === 'Arrived' ? 'bg-orange-500' : 'bg-gray-500'} text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm`}>
    {status}
  </span>
);

export default GuestSelfServices;