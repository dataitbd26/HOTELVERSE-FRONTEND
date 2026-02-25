import React from "react";

const PageHeader = ({ title, subtitle, icon }) => {
  return (
    <div>
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        {/* Render the icon if it's passed, keeping your standard green color */}
        {icon && <span className="text-[#66cc00] flex items-center">{icon}</span>} 
        {title}
      </h2>
      
      {/* Render the subtitle only if it is provided */}
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHeader;