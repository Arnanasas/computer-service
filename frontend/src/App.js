import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./layouts/Main";
import NotFound from "./pages/NotFound";

import publicRoutes from "./routes/PublicRoutes";
import protectedRoutes from "./routes/ProtectedRoutes";
import { AuthProvider } from "./AuthContext";

import ProtectedRoute from "./pages/ProtectedRoute";

// import css

import "./assets/css/remixicon.css";

// import scss
import "./scss/style.scss";
import EditService from "./dashboard/EditService";
import Services from "./dashboard/Services";

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
            <Route path="/" element={<Main />}>
              {protectedRoutes.map((route, index) => {
                return (
                  <Route
                    path={route.path}
                    element={<ProtectedRoute>{route.element}</ProtectedRoute>}
                    key={index}
                  />
                );
              })}

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditService />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/services/:filter"
                element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                }
              ></Route>
            </Route>
            {publicRoutes.map((route, index) => {
              return (
                <Route path={route.path} element={route.element} key={index} />
              );
            })}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </React.Fragment>
  );
}
