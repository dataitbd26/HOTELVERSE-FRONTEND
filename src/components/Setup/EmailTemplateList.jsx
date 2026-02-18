import React from 'react';
import { MdCheck, MdEdit, MdSearch } from 'react-icons/md';

const EmailTemplateList = () => {
  // Mock data based on the screenshot
  const templates = [
    { name: "Booking Invoice", desc: "Email template for stay invoice" },
    { name: "Booking Voucher", desc: "Email sent after reservation with booking voucher" },
    { name: "Checkin", desc: "Email sent after checkin" },
    { name: "Checkout", desc: "Email sent after checkout" },
    { name: "Night Audit Summary", desc: "Email sent to admin on night audit posting" },
    { name: "Self Service Accepted", desc: "Email sent to guest after self service is accepted" },
    { name: "Self Service Rejected", desc: "Email sent to guest after self service is rejected" },
    { name: "Send Digital Menu Link", desc: "Email sent to guest with digital menu link" },
    { name: "Send Guest Self Service Link", desc: "Email sent to guest for self checkin" },
    { name: "Welcome", desc: "Email sent after reservation" },
  ];

  return (
   
   <>
 
    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-gray-100">
      
      {/* Search Bar: Stacks on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2 mb-6 border-b border-gray-100 pb-6">
        <div className="relative w-full sm:w-64">
           <input 
            type="text" 
            placeholder="Name" 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-blue-500" 
          />
        </div>
        <button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-1.5 rounded text-sm font-medium transition flex justify-center items-center">
          <MdSearch className="mr-1 sm:hidden" /> Search
        </button>
      </div>

      {/* Table: Scrollable on mobile (overflow-x-auto) */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="text-xs text-gray-700 uppercase bg-gray-300 font-bold">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 border-b border-gray-300 whitespace-nowrap">Name</th>
                <th scope="col" className="px-4 md:px-6 py-3 border-b border-gray-300 min-w-[200px]">Description</th>
                <th scope="col" className="px-4 md:px-6 py-3 border-b border-gray-300 text-center whitespace-nowrap">Active</th>
                <th scope="col" className="px-4 md:px-6 py-3 border-b border-gray-300 text-center whitespace-nowrap">Send To Admin</th>
                <th scope="col" className="px-4 md:px-6 py-3 border-b border-gray-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((item, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-gray-600">
                    {item.desc}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center">
                    <div className="flex justify-center">
                      <MdCheck className="text-green-500 text-lg font-bold" />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center">
                    <div className="flex justify-center">
                      <MdCheck className="text-green-500 text-lg font-bold" />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-right">
                    <button className="text-gray-400 hover:text-blue-600 border border-gray-300 p-1.5 rounded bg-white transition hover:border-blue-400">
                      <MdEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>


   </>


  );
};

export default EmailTemplateList;