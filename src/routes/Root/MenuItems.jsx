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
  MdComputer,
  MdInsertChart,
  MdSettingsSuggest
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
    // --- Sub-menu: Availability ---
    {
      title: "Availability",
      icon: <MdEvent className="text-lg" />,
     list: [
   
  
    {
      title: "Room Status",
      path: "/front-office/availability/room-status",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Occupancy Forecast",
      path: "/front-office/availability/occupancy-forecast",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Blocked Rooms",
      path: "/front-office/availability/blocked-rooms",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "No Show Report",
      path: "/front-office/availability/no-show-report",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Arrival Report",
      path: "/front-office/availability/arrival-report",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Due Out Today",
      path: "/front-office/availability/due-out-today",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Night Audit Process",
      path: "/front-office/availability/night-audit",
      icon: <MdEvent className="text-lg" />,
    },
]
    },


    //  Views ---
   {
  title: "Views",
  icon: <MdViewList className="text-lg" />,
  list: [
    {
      title: "Checked In Guest",
      path: "/front-office/views/checked-in",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "In House Guest",
      path: "/front-office/views/in-house",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Settlement Pending",
      path: "/front-office/views/settlement-pending",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Opened Folio",
      path: "/front-office/views/opened-folio",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Collection Report",
      path: "/front-office/views/collection-report",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Checkout Pending",
      path: "/front-office/views/checkout-pending",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Checked Out Rooms",
      path: "/front-office/views/checked-out",
      icon: <MdViewList className="text-lg" />,
    },
    {
      title: "Group Reservations",
      path: "/front-office/views/group-reservations",
      icon: <MdViewList className="text-lg" />,
    },
  ],
}, 


    {
      title: "Reports & Graphs",
      path: "/front-office/reports",
      icon: <MdInsertChart className="text-lg" />,
    },
    // --- Sub-menu: Incidental Invoice ---
    {
      title: "Incidental Invoice",
      icon: <MdReceipt className="text-lg" />,
      list: [
        { title: "Rate Plan", path: "/front-office/incidental/rate-plan" },
        { title: "Incidental Invoice", path: "/front-office/incidental/invoice" },
      ]
    },
  {
      title: "Setup",
      icon: <MdSettingsSuggest className="text-lg" />, 
      list: [
        {
          title: "Rooms & Category",
          path: "/front-office/setup/rooms-category",
        },
        {
          title: "Room Rate",
          path: "/front-office/setup/room-rate",
        },
        {
          title: "Charge",
          path: "/front-office/setup/charge",
        },
        {
          title: "Corporate Client",
          path: "/front-office/setup/corporate-client",
        },
        {
          title: "Travel Agent",
          path: "/front-office/setup/travel-agent",
        },
        {
          title: "Business Source",
          path: "/front-office/setup/business-source",
        },
      ],
    },
    // --- Sub-menu: Settings ---
    {
      title: "Settings",
      icon: <MdSettings className="text-lg" />,
      list: [
        { title: "Front Office", path: "/front-office/settings/general" },
        { title: "Print Setting", path: "/front-office/settings/print" },
      ]
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
    // --- NEW: Incidental Invoice Dropdown ---
    {
      title: "Incidental Invoice",
      icon: <MdReceipt className="text-lg" />, 
      list: [
        {
          title: "Rate Plan",
          path: "/house-keeping/incidental-invoice/rate-plan",
        },
        {
          title: "Incidental Invoice",
          path: "/house-keeping/incidental-invoice/details",
        },
      ],
    },
    // --- NEW: Setup Dropdown ---
    {
      title: "Setup",
      icon: <MdSettingsSuggest className="text-lg" />,
      list: [
        {
          title: "House Keepers",
          path: "/house-keeping/setup/house-keepers",
        },
        {
          title: "Status",
          path: "/house-keeping/setup/status",
        },
        {
          title: "Remarks",
          path: "/house-keeping/setup/remarks",
        },
        {
          title: "Work Order Category",
          path: "/house-keeping/setup/work-order-category",
        },
        {
          title: "Units",
          path: "/house-keeping/setup/units",
        },
      ],
    },
    // --- NEW: Settings ---
    {
      title: "Settings",
      path: "/house-keeping/settings",
      icon: <MdSettings className="text-lg" />,
    },
  ],
    },

    
    // --- Point Of Sale (Unique Items Only) ---
    {
      title: "Point Of Sale",
      icon: <MdPointOfSale className="text-lg" />,
      list: [
        {
          title: "Dashboard",
          path: "/pos/dashboard",
          icon: <MdShoppingCart className="text-lg" />,
        },
        
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
         {
          title: "Reports",
          path: "/pos/Reports",
          icon: <MdKitchen className="text-lg" />,
        },
        
  {
    title: "Setup",
    icon: <MdSettingsSuggest className="text-lg" />,
    list: [
      {
        title: "Outlets",
        path: "/pos/setup/outlets",
      },
      {
        title: "Tables",
        path: "/pos/setup/tables",
      },
      {
        title: "Item Category",
        path: "/pos/setup/item-category",
      },
      {
        title: "Rate Plan",
        path: "/pos/setup/rate-plan",
      },
      {
        title: "Department",
        path: "/pos/setup/department",
      },
      {
        title: "KOT Printing Setup",
        path: "/pos/setup/kot-printing",
      },
      {
        title: "Slots",
        path: "/pos/setup/slots",
      },
      {
        title: "Stewards",
        path: "/pos/setup/stewards",
      },
    ],
  },

  {
    title: "Settings",
    path: "/pos/settings",
    icon: <MdSettings className="text-lg" />,
  }
]


      
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