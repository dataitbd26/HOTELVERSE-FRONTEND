import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
// import useCompanyHook from "../../Hook/useCompanyHook";

const Preloader = () => {
    // const { companies, loading, error } = useCompanyHook();

  return (
    <div className="flex items-center justify-center ">
      <div className="relative flex flex-col items-center mt-10">
        {/* Spinning Plate */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg"
        >
          <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
        </motion.div>
        {/* Loading Text */}
        <p className="mt-4 text-lg font-semibold text-gray-600">Please Wait Loading Data...</p>
      </div>
    </div>
  );
};

export default Preloader;