import React from 'react';
import {
  MdHome,
  MdGroup,
  MdBusiness, 
} from "react-icons/md";

const menuItems = () => {
  return [
    {
      title: "Dashboard",
      path: "/dashboard/home",
      icon: <MdHome className="text-lg" />,
    },
    {
      title: "Staff",
      path: "/dashboard/users",
      icon: <MdGroup className="text-lg" />,
    },
    {
      title: "Company",
      path: "/dashboard/company",
      icon: <MdBusiness className="text-lg" />, 
    },

  ];
};

export default menuItems;