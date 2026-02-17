import { createBrowserRouter, Navigate } from "react-router-dom";

import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import Users from "../pages/OtherPage/users";
import PrivateRoot from "./Root/PrivateRoot";
import Aroot from "./Root/Aroot";
import Home from "../pages/Dashboard/Home";
import Company from "../pages/Main/Company";





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
    path: "dashboard",
    element: <Aroot />, 
    errorElement: <Error404 />,
    children: [
      {
        path: "",
        element: (
          <PrivateRoot>
            <Navigate to="home" replace />
          </PrivateRoot>
        ),
      },
      {
        path: "home",
        element: <PrivateRoot><Home /></PrivateRoot>,
      },
      {
        path: "users",
        element: <PrivateRoot><Users /></PrivateRoot>,
      },
         {
        path: "company",
        element: <PrivateRoot><Company /></PrivateRoot>,
      },

    ],
  },
]);
