import React, { useState } from "react";
import {
  Card,
  Col,
  Nav,
  OverlayTrigger,
  Row,
  Table,
  Tooltip,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import axios from "axios";
import Footer from "../layouts/Footer";
import Avatar from "../components/Avatar";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import { useEffect } from "react";

export default function Dashboard() {
  const [dp1, setDp1] = useState([]); // Tikrasis (Actual Profit)
  const [dp2, setDp2] = useState([]); // Planuojamas (Static Planned Profit)
  const [categories, setCategories] = useState([]); // To hold months
  const [dashboardData, setDashboardData] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/dashboard/dashboard-stats`,
          {
            withCredentials: true,
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchDashboardData();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/dashboard/sales-data`,
          {
            withCredentials: true,
          }
        ); // Fetching from sales-data endpoint
        const data = response.data;

        // Filter out entries with null yearMonth and sort the data by yearMonth
        const sortedData = data
          .filter((item) => item.yearMonth) // Exclude entries with null yearMonth
          .sort((a, b) => {
            const [yearA, monthA] = a.yearMonth.split("-").map(Number);
            const [yearB, monthB] = b.yearMonth.split("-").map(Number);
            return yearA - yearB || monthA - monthB;
          });

        // Prepare Tikrasis (Actual) profit and months from yearMonth
        const actualProfits = sortedData.map((item) => item.totalProfit);
        const months = sortedData.map((item) =>
          dayjs(`${item.yearMonth}-01`).format("MMM YYYY")
        );

        // Example static planned profit (Planuojamas) for each month
        const staticProfits = [
          700, 800, 850, 900, 1000, 1100, 1200, 1400, 1500, 1600, 1600, 1650,
          1650, 1700, 1700,
        ];

        setDp1(actualProfits);
        setDp2(staticProfits); // You can adjust the planned data as needed
        setCategories(months); // Set the formatted months
      } catch (error) {
        console.error("Error fetching sales data", error);
      }
    };

    fetchData();

    const fetchOutOfStockProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/dashboard/products-out-of-stock`,
          {
            withCredentials: true,
          }
        );
        setOutOfStockProducts(response.data);
      } catch (error) {
        console.error("Error fetching out-of-stock products:", error);
      }
    };

    fetchOutOfStockProducts();
  }, []);

  const seriesOne = [
    {
      name: "Planuojamas", // Planned
      data: dp2,
    },
    {
      name: "Tikrasis", // Actual
      data: dp1,
    },
  ];

  const optionOne = {
    chart: {
      type: "area",
    },
    xaxis: {
      categories: categories, // Use formatted months as the x-axis labels
    },
  };
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">
                <Link to="#">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Verslo būsena
              </li>
            </ol>
            <h4 className="main-title mb-0">Išsami statistika</h4>
          </div>
        </div>

        <Row className="g-3">
          {dashboardData.map((card, index) => (
            <Col xs="6" xl="3" key={index}>
              <Card className="card-one">
                <Card.Body>
                  <Card.Title as="label" className="fs-sm fw-medium mb-1">
                    {card.label}
                  </Card.Title>
                  <h3 className="card-value mb-1">
                    <i className={card.icon}></i> {card.value}
                  </h3>
                  <small>
                    <span
                      className={
                        "d-inline-flex text-" +
                        (card.status === "up" ? "success" : "danger")
                      }
                    >
                      {card.percent}%{" "}
                      <i
                        className={
                          "ri-arrow-" +
                          (card.status === "up" ? "up" : "down") +
                          "-line"
                        }
                      ></i>
                    </span>{" "}
                    palyginus su praeitu mėn.
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
          <Col xl="7">
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Mėnesinis pajamų prieaugis</Card.Title>
                <Nav className="nav-icon nav-icon-sm ms-auto">
                  <Nav.Link href="">
                    <i className="ri-refresh-line"></i>
                  </Nav.Link>
                  <Nav.Link href="">
                    <i className="ri-more-2-fill"></i>
                  </Nav.Link>
                </Nav>
              </Card.Header>
              <Card.Body>
                <ul className="legend mb-3">
                  <li>Tikrasis</li>
                  <li>Planuojamas</li>
                </ul>
                <ReactApexChart
                  series={seriesOne}
                  options={optionOne}
                  type="area"
                  height={300}
                  className="apex-chart-one mb-4"
                />
                <Row>
                  {outOfStockProducts.length > 0 && (
                    <div className="mb-3">
                      {outOfStockProducts.map((product) => (
                        <Alert key={product._id} variant="warning">
                          Produktas <strong>{product.name}</strong> turi 0 kiekį
                          sandėlyje!
                        </Alert>
                      ))}
                    </div>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Footer />
      </div>
    </React.Fragment>
  );
}
