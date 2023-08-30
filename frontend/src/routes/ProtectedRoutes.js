import React from "react";

import WebsiteAnalytics from "../dashboard/WebsiteAnalytics";

// Apps
import Chat from "../apps/Chat";
// UI Elements
import AddService from "../dashboard/AddService";
import Toasts from "../docs/Toasts";

const protectedRoutes = [
  { path: "/", element: <AddService /> },
  { path: "/add-service", element: <AddService /> },
  { path: "services", element: <WebsiteAnalytics /> },
  { path: "apps/chat", element: <Chat /> },
];

export default protectedRoutes;
