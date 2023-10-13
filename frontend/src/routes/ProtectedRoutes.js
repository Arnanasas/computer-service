import React from "react";

// Apps
import Chat from "../apps/Chat";
// UI Elements
import AddService from "../dashboard/AddService";
import Services from "../dashboard/Services";

const protectedRoutes = [
  { path: "/", element: <Services /> },
  { path: "/add-service", element: <AddService /> },
  { path: "apps/chat", element: <Chat /> },
];

export default protectedRoutes;
