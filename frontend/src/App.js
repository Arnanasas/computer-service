import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './layouts/Main';
import NotFound from "./pages/NotFound";

import publicRoutes from "./routes/PublicRoutes";
import protectedRoutes from "./routes/ProtectedRoutes";
import { AuthProvider } from './AuthContext';

// import css
import "./assets/css/remixicon.css";

// import scss
import "./scss/style.scss";
import Signin from "./pages/Signin";
import WebsiteAnalytics from "./dashboard/WebsiteAnalytics";
import ProtectedRoute from "./pages/ProtectedRoute";


// set skin on load
window.addEventListener("load", function () {
  let skinMode = localStorage.getItem("skin-mode");
  let HTMLTag = document.querySelector("html");

  if (skinMode) {
    HTMLTag.setAttribute("data-skin", skinMode);
  }
});

export default function App() {
  return (
    <React.Fragment>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route index element={<Main />} />
        <Route path="login" element={<Signin />} />
        <Route path="services" element={
        <ProtectedRoute>
          <WebsiteAnalytics />
        </ProtectedRoute>
        } />


          {/* <Route path="/" element={<Main />}>
            {protectedRoutes.map((route, index) => {
              return (
                <Route
                  path={route.path}
                  element={route.element}
                  key={index}
                />
              )
            })}
          </Route>
          {publicRoutes.map((route, index) => {
            return (
              <Route
                path={route.path}
                element={route.element}
                key={index}
              />
            )
          })} */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </React.Fragment>
    
  );
}