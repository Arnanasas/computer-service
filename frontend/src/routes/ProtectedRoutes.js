import React from "react";

// Apps
import Chat from "../apps/Chat";
// UI Elements
import AddService from "../dashboard/AddService";
import Services from "../dashboard/Services";
import Statistics from "../apps/Statistics";
import QuickAdd from "../dashboard/QuickAdd";
import Dashboard from "../apps/Dashboard";
import AddPreInvoice from "../dashboard/AddPreInvoice";
import Works from "../dashboard/Works";
import Inventory from "../dashboard/Inventory";
import AddInventory from "../dashboard/AddInventory";
import CaptureSignature from "../dashboard/CaptureSignature";

const protectedRoutes = [
  { path: "/", element: <Services /> },
  { path: "/add-service", element: <AddService /> },
  { path: "/quick-add", element: <QuickAdd /> },
  { path: "/add-pre-invoice", element: <AddPreInvoice /> },
  { path: "apps/chat", element: <Chat /> },
  { path: "apps/statistics", element: <Statistics /> },
  { path: "apps/dashboard", element: <Dashboard /> },
  { path: "/inventory", element: <Inventory /> },
  { path: "/inventory/add", element: <AddInventory /> },
  { path: "/capture-signature", element: <CaptureSignature /> },
  { path: "/works", element: <Works /> },
];

export default protectedRoutes;
