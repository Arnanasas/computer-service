import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";

import { Row, Col, Form } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import img14 from "../assets/img/img14.jpg";
import img16 from "../assets/img/img16.jpg";
import axios from "axios";
import { useAuth } from "../AuthContext";
import SalesChart from "./SalesChart";

export default function Statistics({ itemId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  // eslint-disable-next-line
  const { nickname } = useAuth();

  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_URL}/dashboard/sales-data`, {
        withCredentials: true,
      })
      .then((response) => {
        setSalesData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error}</p>;
  }

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />

      <div className="main main-app p-3 p-lg-4">
        <h1>Pardavimų grafikas</h1>
        <div style={{ height: "100%", width: "100%" }}>
          <SalesChart salesData={salesData} />
        </div>
      </div>

      {/* <Footer /> */}
    </React.Fragment>
  );
}
