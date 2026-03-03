import React from "react";
import { FaChevronDown } from "react-icons/fa";

const CustomDropdown = ({ 
  name, 
  value, 
  onChange, 
  options = [], 
  defaultLabel, 
  className = "" 
}) => {
  return (
    <div className={`relative group w-full sm:w-auto flex-grow max-w-xs ${className}`}>
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm font-medium text-[#3d4451] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#66cc00]/50 focus:border-[#66cc00] bg-white dark:bg-gray-700 appearance-none cursor-pointer transition-colors shadow-sm"
      >
        <option value={defaultLabel}>{defaultLabel}</option>
        {options.map((opt, idx) => {
          // Handle both object { label, value } arrays and simple string arrays
          const isObject = typeof opt === 'object';
          const optValue = isObject ? (opt.value || opt._id) : opt;
          const optLabel = isObject ? (opt.label || opt.name || opt.categoryName) : opt;

          return (
            <option key={idx} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs group-hover:text-[#66cc00] transition-colors"/>
    </div>
  );
};

export default CustomDropdown;