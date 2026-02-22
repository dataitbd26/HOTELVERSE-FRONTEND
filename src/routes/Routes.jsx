import { createBrowserRouter, Navigate } from "react-router-dom";

import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";

import Reservation from "../pages/Frontoffice/Reservation";

import GuestProfiles from "../pages/Frontoffice/GuestProfiles";
import WalkIn from "../pages/Frontoffice/WalkIn";
import TodaysEvents from "../pages/Frontoffice/TodaysEvents";
import GuestSelfServices from "../pages/Frontoffice/GuestSelfServices";
import ReservationList from "../pages/Frontoffice/ReservationList";
import Availability from "../pages/Frontoffice/Availability";
import Views from "../pages/Frontoffice/Views";
import DailyStatus from "../pages/HouseKeeping/DailyStatus";
import RoomCleaning from "../pages/HouseKeeping/RoomCleaning";

import WorkOrders from "../pages/HouseKeeping/WorkOrders";
import LostAndFound from "../pages/HouseKeeping/LostAndFound";
import POS from "../pages/PointOfSale/POS";
import TableReservations from "../pages/PointOfSale/TableReservations";
import KitchenDisplaySystem from "../pages/PointOfSale/KitchenDisplaySystem";
import NewBooking from "../pages/Banquet/NewBooking";
import BookingList from "../pages/Banquet/BookingList";
import CalendarView from "../pages/Banquet/CalendarView";
import PurchaseOrder from "../pages/Stores/PurchaseOrder";
import GoodsReceiptNote from "../pages/Stores/GoodsReceiptNote";
import Requisition from "../pages/Stores/Requisition";
import StockTransfer from "../pages/Stores/StockTransfer";
import OpeningStock from "../pages/Stores/OpeningStock";
import StockReceipt from "../pages/Stores/StockReceipt";
import StockIssue from "../pages/Stores/StockIssue";
import StockWastage from "../pages/Stores/StockWastage";
import Purchase from "../pages/Accounts/Purchase";
import PurchaseReturn from "../pages/Accounts/PurchaseReturn";
import CustomerReceipt from "../pages/Accounts/CustomerReceipt";
import Customer_Receipt from "../pages/Accounts/Customer_Receipt";
import Receipt from "../pages/Accounts/Receipt";
import Payment from "../pages/Accounts/Payment";
import CreditNote from "../pages/Accounts/CreditNote";
import Journal from "../pages/Accounts/Journal";
import Contra from "../pages/Accounts/Contra";
import TallyInterface from "../pages/Accounts/TallyInterface";
import E_Invoice from "../pages/Accounts/E_Invoice";
import TaxSetup from "../pages/Setup/TaxSetup";
import PaymentMode from "../pages/Setup/PaymentMode";
import EmailAccount from "../pages/Setup/EmailAccount";
import Whatsapp from "../pages/Setup/Whatsapp";
import Nationality from "../pages/Setup/Nationality";
import Country from "../pages/Setup/Country";
import BillPrefix from "../pages/Setup/BillPrefix";
import MultiCurrency from "../pages/Setup/MultiCurrency";
import BookingEngine from "../pages/Setup/BookingEngine";
import FeedBackMaster from "../pages/Setup/FeedBackMaster";
import Properties from "../pages/Administration/Properties";
import UserRoles from "../pages/Administration/UserRoles";
import Users from "../pages/Administration/Users";
import LoginActivites from "../pages/Administration/LoginActivites";
import UserActivite from "../pages/Administration/UserActivite";
import RoomStatus from "../pages/Availability/RoomStatus";
import OccupancyForecast from "../pages/Availability/OccupancyForecast";
import BlockedRooms from "../pages/Availability/BlockedRooms";
import NoShowReport from "../pages/Availability/NoShowReport";
import ArrivalReport from "../pages/Availability/ArrivalReport";
import DueOutToday from "../pages/Availability/DueOutToday";
import NightAuditProcess from "../pages/Availability/NightAuditProcess";
import CheckedInGuest from "../pages/Frontoffice/views/CheckedInGuest";
import Home from "../pages/Dashboard/Home";
import RatePlan from "../pages/HouseKeeping/IncidentalInvoice/RatePlan";
import IncidentalInvoiceDetails from "../pages/HouseKeeping/IncidentalInvoice/IncidentalInvoiceDetails";
import HouseKeepers from "../pages/HouseKeeping/Setup/HouseKeepers";
import StatusSetup from "../pages/HouseKeeping/Setup/StatusSetup";
import RemarksSetup from "../pages/HouseKeeping/Setup/RemarksSetup";
import WorkOrderCategory from "../pages/HouseKeeping/Setup/WorkOrderCategory";
import UnitsSetup from "../pages/HouseKeeping/Setup/UnitsSetup";
import HouseKeepingSettings from "../pages/HouseKeeping/HouseKeepingSettings";








export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
   
   

      // If you still need the Login page, you can add it on a separate path like this:
      {
        path: "/",
        element: <Login />,
      },
    ],
  },
  {
    // Pathless layout route to wrap everything in Aroot (Sidebar/Header)
    element: <Aroot />,
    errorElement: <Error404 />,
    children: [
      // --- Dashboard ---
      {
        path: "dashboard",
        element: <PrivateRoot><Home/></PrivateRoot>,
      },

      // --- Front Office ---
      {
        path: "front-office/reservation",
        element: <PrivateRoot><Reservation/></PrivateRoot>,
      },
      {
        path: "front-office/walk-in",
        element: <PrivateRoot><WalkIn /></PrivateRoot>,
      },
      {
        path: "front-office/events",
        element: <PrivateRoot><TodaysEvents /></PrivateRoot>,
      },
      {
        path: "front-office/self-services",
        element: <PrivateRoot><GuestSelfServices /></PrivateRoot>,
      },
      {
        path: "front-office/profiles",
        element: <PrivateRoot><GuestProfiles /></PrivateRoot>,
      },
      {
        path: "front-office/reservation-list",
        element: <PrivateRoot><ReservationList /></PrivateRoot>,
      },
     {
  path: "front-office",
  children: [
    // ... your other front-office routes (Reservation, Walk In, etc.)

    // --- NESTED  ROUTE ---
    {
      path: "availability",
      children: [
        // 1. Main Page: Matches "/front-office/availability"
        {
          index: true, 
          element: (
            <PrivateRoot>
              <Availability />
            </PrivateRoot>
          ),
        },
        // 2. Sub-Pages: Match "/front-office/availability/..."
        {
          path: "room-status",
          element: (
            <PrivateRoot>
              <RoomStatus />
            </PrivateRoot>
          ),
        },
        {
          path: "occupancy-forecast",
          element: (
            <PrivateRoot>
              <OccupancyForecast />
            </PrivateRoot>
          ),
        },
        {
          path: "blocked-rooms",
          element: (
            <PrivateRoot>
              <BlockedRooms />
            </PrivateRoot>
          ),
        },
        {
          path: "no-show-report",
          element: (
            <PrivateRoot>
              <NoShowReport />
            </PrivateRoot>
          ),
        },
        {
          path: "arrival-report",
          element: (
            <PrivateRoot>
              <ArrivalReport />
            </PrivateRoot>
          ),
        },
        {
          path: "due-out-today",
          element: (
            <PrivateRoot>
              <DueOutToday />
            </PrivateRoot>
          ),
        },
        {
          path: "night-audit",
          element: (
            <PrivateRoot>
              <NightAuditProcess />
            </PrivateRoot>
          ),
        },
      ],
    },
  ],
},
     // --- 2. VIEWS SUB-MENU (From D3.PNG / D6.PNG) ---
          {
            path: "views",
            children: [
              { path: "checked-in", element: <PrivateRoot><CheckedInGuest /></PrivateRoot> },
              // { path: "in-house", element: <PrivateRoot><InHouseGuest /></PrivateRoot> },
              // { path: "settlement-pending", element: <PrivateRoot><SettlementPending /></PrivateRoot> },
              // { path: "opened-folio", element: <PrivateRoot><OpenedFolio /></PrivateRoot> },
              // { path: "collection-report", element: <PrivateRoot><CollectionReport /></PrivateRoot> },
              // { path: "checkout-pending", element: <PrivateRoot><CheckoutPending /></PrivateRoot> },
              // { path: "checked-out", element: <PrivateRoot><CheckedOutRooms /></PrivateRoot> },
              // { path: "group-reservations", element: <PrivateRoot><GroupReservations /></PrivateRoot> },
            ],
          },

      // --- House Keeping ---
      {
        path: "house-keeping/daily-status",
        element: <PrivateRoot><DailyStatus /></PrivateRoot>,
      },
      {
        path: "house-keeping/room-cleaning",
        element: <PrivateRoot><RoomCleaning /></PrivateRoot>,
      },
      {
        path: "house-keeping/blocked-rooms",
        element: <PrivateRoot><BlockedRooms /></PrivateRoot>,
      },
      {
        path: "house-keeping/work-orders",
        element: <PrivateRoot><WorkOrders /></PrivateRoot>,
      },
      {
        path: "house-keeping/lost-found",
        element: <PrivateRoot><LostAndFound /></PrivateRoot>,
      },
      {
      path: "house-keeping",
      children: [
        // --- Main Top-Level Pages ---
        {
          path: "daily-status",
          element: (
            <PrivateRoot>
              <DailyStatus />
            </PrivateRoot>
          ),
        },
        {
          path: "room-cleaning",
          element: (
            <PrivateRoot>
              <RoomCleaning />
            </PrivateRoot>
          ),
        },
        {
          path: "blocked-rooms",
          element: (
            <PrivateRoot>
              <BlockedRooms />
            </PrivateRoot>
          ),
        },
        {
          path: "work-orders",
          element: (
            <PrivateRoot>
              <WorkOrders />
            </PrivateRoot>
          ),
        },
        {
          path: "lost-found",
          element: (
            <PrivateRoot>
              <LostAndFound />
            </PrivateRoot>
          ),
        },

        // --- Incidental Invoice Dropdown ---
        {
          path: "incidental-invoice",
          children: [
            {
              path: "rate-plan",
              element: (
                <PrivateRoot>
                  <RatePlan />
                </PrivateRoot>
              ),
            },
            {
              path: "details", 
              element: (
                <PrivateRoot>
                  <IncidentalInvoiceDetails />
                </PrivateRoot>
              ),
            },
          ],
        },

        // --- Setup Dropdown ---
        {
          path: "setup",
          children: [
            {
              path: "house-keepers",
              element: (
                <PrivateRoot>
                  <HouseKeepers />
                </PrivateRoot>
              ),
            },
            {
              path: "status",
              element: (
                <PrivateRoot>
                  <StatusSetup />
                </PrivateRoot>
              ),
            },
            {
              path: "remarks",
              element: (
                <PrivateRoot>
                  <RemarksSetup />
                </PrivateRoot>
              ),
            },
            {
              path: "work-order-category",
              element: (
                <PrivateRoot>
                  <WorkOrderCategory />
                </PrivateRoot>
              ),
            },
            {
              path: "units",
              element: (
                <PrivateRoot>
                  <UnitsSetup />
                </PrivateRoot>
              ),
            },
          ],
        },

        // --- Settings ---
        {
          path: "settings",
          element: (
            <PrivateRoot>
              <HouseKeepingSettings />
            </PrivateRoot>
          ),
        },
      ],
    },

      // next task

      // --- Point Of Sale ---
      {
        path: "pos/main",
        element: <PrivateRoot><POS /></PrivateRoot>,
      },
      {
        path: "pos/table-reservations",
        element: <PrivateRoot><TableReservations /></PrivateRoot>,
      },
      {
        path: "pos/kitchen-display",
        element: <PrivateRoot><KitchenDisplaySystem /></PrivateRoot>,
      },

      // --- Banquet ---
      {
        path: "banquet/new-booking",
        element: <PrivateRoot><NewBooking /></PrivateRoot>,
      },
      {
        path: "banquet/booking-list",
        element: <PrivateRoot><BookingList /></PrivateRoot>,
      },
      {
        path: "banquet/calendar",
        element: <PrivateRoot><CalendarView /></PrivateRoot>,
      },

      // --- Stores ---
      {
        path: "stores/purchase-order",
        element: <PrivateRoot><PurchaseOrder /></PrivateRoot>,
      },
      {
        path: "stores/grn",
        element: <PrivateRoot><GoodsReceiptNote /></PrivateRoot>,
      },
      {
        path: "stores/requisition",
        element: <PrivateRoot><Requisition /></PrivateRoot>,
      },
      {
        path: "stores/stock-transfer",
        element: <PrivateRoot><StockTransfer /></PrivateRoot>,
      },
      {
        path: "stores/opening-stock",
        element: <PrivateRoot><OpeningStock /></PrivateRoot>,
      },
      {
        path: "stores/stock-receipt",
        element: <PrivateRoot><StockReceipt /></PrivateRoot>,
      },
      {
        path: "stores/stock-issue",
        element: <PrivateRoot><StockIssue /></PrivateRoot>,
      },
      {
        path: "stores/stock-wastage",
        element: <PrivateRoot><StockWastage /></PrivateRoot>,
      },

      // --- Accounts ---
      {
        path: "accounts/purchase",
        element: <PrivateRoot><Purchase /></PrivateRoot>,
      },
      {
        path: "accounts/purchase-return",
        element: <PrivateRoot><PurchaseReturn /></PrivateRoot>,
      },
      {
        path: "accounts/customer-receipt",
        element: <PrivateRoot><CustomerReceipt /></PrivateRoot>,
      },
      {
        path: "accounts/supplier-payment",
        element: <PrivateRoot><Customer_Receipt /></PrivateRoot>,
      },
      {
        path: "accounts/receipt",
        element: <PrivateRoot><Receipt /></PrivateRoot>,
      },
      {
        path: "accounts/payment",
        element: <PrivateRoot><Payment /></PrivateRoot>,
      },
      {
        path: "accounts/credit-note",
        element: <PrivateRoot><CreditNote /></PrivateRoot>,
      },
      {
        path: "accounts/journal",
        element: <PrivateRoot><Journal /></PrivateRoot>,
      },
      {
        path: "accounts/contra",
        element: <PrivateRoot><Contra /></PrivateRoot>,
      },
      {
        path: "accounts/tally-interface",
        element: <PrivateRoot><TallyInterface /></PrivateRoot>,
      },
      {
        path: "accounts/e-invoice",
        element: <PrivateRoot><E_Invoice /></PrivateRoot>,
      },

      // --- Setup ---
      {
        path: "setup/tax",
        element: <PrivateRoot><TaxSetup /></PrivateRoot>,
      },
      {
        path: "setup/payment-mode",
        element: <PrivateRoot><PaymentMode /></PrivateRoot>,
      },
      {
        path: "setup/email",
        element: <PrivateRoot><EmailAccount /></PrivateRoot>,
      },
      {
        path: "setup/whatsapp",
        element: <PrivateRoot><Whatsapp /></PrivateRoot>,
      },
      {
        path: "setup/e-invoice",
        element: <PrivateRoot><E_Invoice /></PrivateRoot>,
      },
      {
        path: "setup/nationality",
        element: <PrivateRoot><Nationality /></PrivateRoot>,
      },
      {
        path: "setup/country",
        element: <PrivateRoot><Country /></PrivateRoot>,
      },
      {
        path: "setup/bill-prefix",
        element: <PrivateRoot><BillPrefix /></PrivateRoot>,
      },
      {
        path: "setup/multi-currency",
        element: <PrivateRoot><MultiCurrency /></PrivateRoot>,
      },
      {
        path: "setup/booking-engine",
        element: <PrivateRoot><BookingEngine /></PrivateRoot>,
      },
      {
        path: "setup/feedback-master",
        element: <PrivateRoot><FeedBackMaster /></PrivateRoot>,
      },

      // --- Administration ---
      {
        path: "administration/properties",
        element: <PrivateRoot><Properties /></PrivateRoot>,
      },
      {
        path: "administration/user-roles",
        element: <PrivateRoot><UserRoles /></PrivateRoot>,
      },
      {
        path: "administration/users",
        element: <PrivateRoot><Users /></PrivateRoot>,
      },
      {
        path: "administration/login-activities",
        element: <PrivateRoot><LoginActivites /></PrivateRoot>,
      },
      {
        path: "administration/user-activities",
        element: <PrivateRoot><UserActivite /></PrivateRoot>,
      },
      
      // --- Logout ---
      {
        path: "logout",
        element: <PrivateRoot><Navigate to="/" replace /></PrivateRoot>,
      },
    ],
  },
]);