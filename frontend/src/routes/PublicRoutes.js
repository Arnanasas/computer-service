import React from "react";
import NotFound from "../pages/NotFound";
import Signin from "../pages/Signin";

const publicRoutes = [
  { path: "login", element: <Signin /> },
  { path: "pages/error-404", element: <NotFound /> },
];

export default publicRoutes;
