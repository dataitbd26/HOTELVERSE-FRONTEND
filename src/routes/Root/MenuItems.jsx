import React from 'react';
import {
  MdDashboard,
  MdViewList,
  MdDesktopMac,
  MdCleaningServices,
  MdPointOfSale,
  MdEvent,
  MdLayers,
  MdAccountBalance,
  MdSettings,
  MdAdminPanelSettings,
  MdLogout,
  MdDateRange,
  MdPeople,
  MdEventNote,
  MdAssignment,
  MdDescription,
  MdReceipt,
  MdShoppingCart,
  MdKitchen,
  MdTableRestaurant,
  MdInventory,
  MdLocalShipping,
  MdSwapHoriz,
  MdInput,
  MdOutput,
  MdDeleteSweep,
  MdAttachMoney,
  MdMoneyOff,
  MdNoteAdd,
  MdAccountBalanceWallet,
  MdVpnKey,
  MdLanguage,
  MdFlag,
  MdCurrencyExchange,
  MdFeedback,
  MdBusiness,
  MdSupervisedUserCircle,
  MdHistory,
  MdSecurity,
  MdComputer
} from "react-icons/md";

const useMenuItems = () => {
  const allItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard className="text-lg" />,
    },
    // --- Front Office (Unique Items Only) ---
    {
      title: "Front Office",
      icon: <MdDesktopMac className="text-lg" />,
      list: [
        {
          title: "Reservation",
          path: "/front-office/reservation",
          icon: <MdDateRange className="text-lg" />,
        },
        {
          title: "Walk In",
          path: "/front-office/walk-in",
          icon: <MdPeople className="text-lg" />,
        },
        {
          title: "Today's Events",
          path: "/front-office/events",
          icon: <MdEventNote className="text-lg" />,
        },
        {
          title: "Guest Self Services",
          path: "/front-office/self-services",
          icon: <MdAssignment className="text-lg" />,
        },
        {
          title: "Guest Profiles",
          path: "/front-office/profiles",
          icon: <MdPeople className="text-lg" />,
        },
        {
          title: "Reservation List",
          path: "/front-office/reservation-list",
          icon: <MdDescription className="text-lg" />,
        },
        {
          title: "Availability",
          path: "/front-office/availability",
          icon: <MdEvent className="text-lg" />,
        },
        {
          title: "Views",
          path: "/front-office/views",
          icon: <MdViewList className="text-lg" />,
        },
      ],
    },
    // --- House Keeping (Unique Items Only) ---
    {
      title: "House Keeping",
      icon: <MdCleaningServices className="text-lg" />,
      list: [
        {
          title: "Daily Status",
          path: "/house-keeping/daily-status",
          icon: <MdDescription className="text-lg" />,
        },
        {
          title: "Room Cleaning",
          path: "/house-keeping/room-cleaning",
          icon: <MdCleaningServices className="text-lg" />,
        },
        {
          title: "Blocked Rooms",
          path: "/house-keeping/blocked-rooms",
          icon: <MdSecurity className="text-lg" />,
        },
        {
          title: "Work Orders",
          path: "/house-keeping/work-orders",
          icon: <MdAssignment className="text-lg" />,
        },
        {
          title: "Lost And Found",
          path: "/house-keeping/lost-found",
          icon: <MdHistory className="text-lg" />,
        },
      ],
    },
    // --- Point Of Sale (Unique Items Only) ---
    {
      title: "Point Of Sale",
      icon: <MdPointOfSale className="text-lg" />,
      list: [
        {
          title: "POS",
          path: "/pos/main",
          icon: <MdShoppingCart className="text-lg" />,
        },
        {
          title: "Table Reservations",
          path: "/pos/table-reservations",
          icon: <MdTableRestaurant className="text-lg" />,
        },
        {
          title: "Kitchen Display System",
          path: "/pos/kitchen-display",
          icon: <MdKitchen className="text-lg" />,
        },
      ],
    },
    // --- Banquet (Unique Items Only) ---
    {
      title: "Banquet",
      icon: <MdEvent className="text-lg" />,
      list: [
        {
          title: "New Booking",
          path: "/banquet/new-booking",
          icon: <MdNoteAdd className="text-lg" />,
        },
        {
          title: "Booking List",
          path: "/banquet/booking-list",
          icon: <MdViewList className="text-lg" />,
        },
        {
          title: "Calendar View",
          path: "/banquet/calendar",
          icon: <MdDateRange className="text-lg" />,
        },
      ],
    },
    // --- Stores (Unique Items Only) ---
    {
      title: "Stores",
      icon: <MdLayers className="text-lg" />,
      list: [
        {
          title: "Purchase Order",
          path: "/stores/purchase-order",
          icon: <MdShoppingCart className="text-lg" />,
        },
        {
          title: "Goods Receipt Note",
          path: "/stores/grn",
          icon: <MdReceipt className="text-lg" />,
        },
        {
          title: "Requisition",
          path: "/stores/requisition",
          icon: <MdDescription className="text-lg" />,
        },
        {
          title: "Stock Transfer",
          path: "/stores/stock-transfer",
          icon: <MdSwapHoriz className="text-lg" />,
        },
        {
          title: "Opening Stock",
          path: "/stores/opening-stock",
          icon: <MdInventory className="text-lg" />,
        },
        {
          title: "Stock Receipt",
          path: "/stores/stock-receipt",
          icon: <MdInput className="text-lg" />,
        },
        {
          title: "Stock Issue",
          path: "/stores/stock-issue",
          icon: <MdOutput className="text-lg" />,
        },
        {
          title: "Stock Wastage",
          path: "/stores/stock-wastage",
          icon: <MdDeleteSweep className="text-lg" />,
        },
      ],
    },
    // --- Accounts (Unique Items Only) ---
    {
      title: "Accounts",
      icon: <MdAccountBalance className="text-lg" />,
      list: [
        {
          title: "Purchase",
          path: "/accounts/purchase",
          icon: <MdShoppingCart className="text-lg" />,
        },
        {
          title: "Purchase Return",
          path: "/accounts/purchase-return",
          icon: <MdSwapHoriz className="text-lg" />,
        },
        {
          title: "Customer Receipt",
          path: "/accounts/customer-receipt",
          icon: <MdReceipt className="text-lg" />,
        },
        {
          title: "Supplier Payment",
          path: "/accounts/supplier-payment",
          icon: <MdAttachMoney className="text-lg" />,
        },
        {
          title: "Receipt",
          path: "/accounts/receipt",
          icon: <MdReceipt className="text-lg" />,
        },
        {
          title: "Payment",
          path: "/accounts/payment",
          icon: <MdAttachMoney className="text-lg" />,
        },
        {
          title: "Credit Note",
          path: "/accounts/credit-note",
          icon: <MdNoteAdd className="text-lg" />,
        },
        {
          title: "Journal",
          path: "/accounts/journal",
          icon: <MdDescription className="text-lg" />,
        },
        {
          title: "Contra",
          path: "/accounts/contra",
          icon: <MdSwapHoriz className="text-lg" />,
        },
        {
          title: "Tally Interface",
          path: "/accounts/tally-interface",
          icon: <MdComputer className="text-lg" />,
        },
        {
          title: "E-Invoice",
          path: "/accounts/e-invoice",
          icon: <MdDescription className="text-lg" />,
        },
      ],
    },
    // --- Global Setup (Kept as Master Config) ---
    {
      title: "Setup",
      icon: <MdSettings className="text-lg" />,
      list: [
        {
          title: "Tax Setup",
          path: "/setup/tax",
          icon: <MdMoneyOff className="text-lg" />,
        },
        {
          title: "Payment Mode",
          path: "/setup/payment-mode",
          icon: <MdAccountBalanceWallet className="text-lg" />,
        },
        {
          title: "Email Account",
          path: "/setup/email",
          icon: <MdInput className="text-lg" />,
        },
        {
          title: "Whatsapp",
          path: "/setup/whatsapp",
          icon: <MdInput className="text-lg" />,
        },
        {
          title: "E-Invoice",
          path: "/setup/e-invoice",
          icon: <MdDescription className="text-lg" />,
        },
        {
          title: "Nationality",
          path: "/setup/nationality",
          icon: <MdFlag className="text-lg" />,
        },
        {
          title: "Country",
          path: "/setup/country",
          icon: <MdLanguage className="text-lg" />,
        },
        {
          title: "Bill Prefix",
          path: "/setup/bill-prefix",
          icon: <MdNoteAdd className="text-lg" />,
        },
        {
          title: "Multi Currency",
          path: "/setup/multi-currency",
          icon: <MdCurrencyExchange className="text-lg" />,
        },
        {
          title: "Booking Engine",
          path: "/setup/booking-engine",
          icon: <MdDesktopMac className="text-lg" />,
        },
        {
          title: "FeedBack Master",
          path: "/setup/feedback-master",
          icon: <MdFeedback className="text-lg" />,
        },
      ],
    },
    // --- Administration (Unique Items Only) ---
    {
      title: "Administration",
      icon: <MdAdminPanelSettings className="text-lg" />,
      list: [
        {
          title: "Properties",
          path: "/administration/properties",
          icon: <MdBusiness className="text-lg" />,
        },
        {
          title: "User Roles",
          path: "/administration/user-roles",
          icon: <MdVpnKey className="text-lg" />,
        },
        {
          title: "Users",
          path: "/administration/users",
          icon: <MdSupervisedUserCircle className="text-lg" />,
        },
        {
          title: "Login Activites",
          path: "/administration/login-activities",
          icon: <MdHistory className="text-lg" />,
        },
        {
          title: "User Activites",
          path: "/administration/user-activities",
          icon: <MdHistory className="text-lg" />,
        },
      ],
    },
    {
      title: "Logout",
      path: "/logout",
      icon: <MdLogout className="text-lg" />,
    },
  ];

  return allItems;
};

export default useMenuItems;