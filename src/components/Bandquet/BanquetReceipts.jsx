import React from 'react';

const BanquetReceipts = () => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 mb-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gray-600 font-bold">Receipts</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded font-medium shadow-sm transition">
          Settle
        </button>
      </div>

      {/* Table Section */}
      <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-300 text-gray-800 font-bold text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Ref. #</th>
                <th className="px-4 py-3">Particular</th>
                <th className="px-4 py-3">Pay Mode</th>
                <th className="px-4 py-3">A/C Pay</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Disc.</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white h-16">
               {/* Empty Row for Visual Match */}
               <tr>
                 <td colSpan="8"></td>
               </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Totals */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">TOTAL</span>
          <input type="text" defaultValue="0.00" className="w-32 border border-gray-400 rounded px-2 py-1 text-right text-sm bg-gray-100" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">DUE</span>
          <input type="text" defaultValue="0.00" className="w-32 border border-gray-400 rounded px-2 py-1 text-right text-sm bg-white" />
        </div>
      </div>

    </div>
  );
};

export default BanquetReceipts;