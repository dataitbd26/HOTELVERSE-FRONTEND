import { createBrowserRouter, Navigate } from "react-router-dom";

import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";
import Home from "../pages/Dashboard/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
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
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Front Office ---
      {
        path: "front-office/reservation",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/walk-in",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/events",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/self-services",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/profiles",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/reservation-list",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/availability",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "front-office/views",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- House Keeping ---
      {
        path: "house-keeping/daily-status",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "house-keeping/room-cleaning",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "house-keeping/blocked-rooms",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "house-keeping/work-orders",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "house-keeping/lost-found",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Point Of Sale ---
      {
        path: "pos/main",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "pos/table-reservations",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "pos/kitchen-display",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Banquet ---
      {
        path: "banquet/new-booking",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "banquet/booking-list",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "banquet/calendar",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Stores ---
      {
        path: "stores/purchase-order",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/grn",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/requisition",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/stock-transfer",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/opening-stock",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/stock-receipt",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/stock-issue",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "stores/stock-wastage",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Accounts ---
      {
        path: "accounts/purchase",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/purchase-return",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/customer-receipt",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/supplier-payment",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/receipt",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/payment",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/credit-note",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/journal",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/contra",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/tally-interface",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "accounts/e-invoice",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Setup ---
      {
        path: "setup/tax",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/payment-mode",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/email",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/whatsapp",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/e-invoice",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/nationality",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/country",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/bill-prefix",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/multi-currency",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/booking-engine",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "setup/feedback-master",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },

      // --- Administration ---
      {
        path: "administration/properties",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "administration/user-roles",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "administration/users",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "administration/login-activities",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "administration/user-activities",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      
      // --- Logout ---
      {
        path: "logout",
        element: <PrivateRoot><Navigate to="/" replace /></PrivateRoot>,
      },
    ],
  },
]);