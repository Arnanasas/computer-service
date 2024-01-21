import React from "react";

// Apps
import Chat from "../apps/Chat";
// UI Elements
import AddService from "../dashboard/AddService";
import Services from "../dashboard/Services";
import Statistics from "../apps/Statistics";
import QuickAdd from "../dashboard/QuickAdd";

const protectedRoutes = [
  { path: "/", element: <Services /> },
  { path: "/add-service", element: <AddService /> },
  { path: "/quick-add", element: <QuickAdd /> },
  { path: "apps/chat", element: <Chat /> },
  { path: "apps/statistics", element: <Statistics /> },
];

export default protectedRoutes;
