import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Nav,
  OverlayTrigger,
  ProgressBar,
  Row,
  Table,
  Tooltip,
} from "react-bootstrap";
import { dp1, dp2 } from "../data/DashboardData";
import ReactApexChart from "react-apexcharts";
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

export default function WebsiteAnalytics() {
  var data = [
    [0, 9],
    [1, 7],
    [2, 4],
    [3, 8],
    [4, 4],
    [5, 12],
    [6, 4],
    [7, 6],
    [8, 5],
    [9, 10],
    [10, 4],
    [11, 5],
    [12, 10],
    [13, 2],
    [14, 6],
  ];

  const chart = {
    parentHeightOffset: 0,
    stacked: true,
    sparkline: {
      enabled: true,
    },
  };

  const states = {
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  };

  const plotOptions = {
    bar: {
      columnWidth: "60%",
    },
  };

  const stroke = {
    curve: "straight",
    lineCap: "square",
  };

  const seriesOne = [
    {
      type: "column",
      data: [
        [0, 0],
        [1, 0],
        [2, 5],
        [3, 10],
        [4, 6],
        [5, 10],
        [6, 15],
        [7, 18],
        [8, 7],
        [9, 11],
        [10, 13],
        [11, 15],
        [12, 13],
        [13, 7],
        [14, 5],
      ],
    },
    {
      type: "column",
      data: data,
    },
  ];

  const optionOne = {
    chart: chart,
    states: states,
    colors: ["#506fd9", "#e5e9f2"],
    plotOptions: plotOptions,
    stroke: stroke,
    fill: { opacity: 1 },
    tooltip: { enabled: false },
  };

  const seriesTwo = [
    {
      type: "column",
      data: [
        [0, 3],
        [1, 4],
        [2, 12],
        [3, 6],
        [4, 16],
        [5, 5],
        [6, 8],
        [7, 4],
        [8, 3],
        [9, 6],
        [10, 4],
        [11, 10],
        [12, 3],
        [13, 7],
        [14, 10],
      ],
    },
    {
      type: "column",
      data: data,
    },
  ];

  const optionTwo = {
    chart: chart,
    states: states,
    colors: ["#85b6fe", "#e5e9f2"],
    plotOptions: plotOptions,
    stroke: stroke,
    fill: { opacity: 1 },
    tooltip: { enabled: false },
  };

  const seriesThree = [
    {
      type: "column",
      data: [
        [0, 5],
        [1, 10],
        [2, 20],
        [3, 15],
        [4, 6],
        [5, 10],
        [6, 15],
        [7, 18],
        [8, 7],
        [9, 11],
        [10, 13],
        [11, 15],
        [12, 13],
        [13, 7],
        [14, 5],
      ],
    },
    {
      type: "column",
      data: data,
    },
  ];

  const optionThree = {
    chart: chart,
    states: states,
    colors: ["#0dcaf0", "#e5e9f2"],
    plotOptions: plotOptions,
    stroke: stroke,
    fill: { opacity: 1 },
    tooltip: { enabled: false },
  };

  const seriesFour = [
    {
      data: [
        [0, 1000],
        [1, 600],
        [2, 500],
        [3, 400],
        [4, 600],
        [5, 500],
        [6, 800],
        [7, 1000],
        [8, 900],
        [9, 1100],
        [10, 1500],
        [11, 1700],
        [12, 1400],
        [13, 1300],
        [14, 1500],
        [15, 1300],
        [16, 1200],
        [17, 1000],
        [18, 1100],
        [19, 800],
        [20, 500],
        [21, 300],
        [22, 500],
        [23, 600],
        [24, 500],
        [25, 600],
        [26, 800],
        [27, 1000],
        [28, 900],
        [29, 800],
        [30, 500],
      ],
    },
    {
      data: [
        [0, 30],
        [1, 30],
        [2, 30],
        [3, 30],
        [4, 30],
        [5, 30],
        [6, 30],
        [7, 30],
        [8, 30],
        [9, 30],
        [10, 30],
        [11, 30],
        [12, 30],
        [13, 30],
        [14, 30],
        [15, 30],
        [16, 30],
        [17, 30],
        [18, 30],
        [19, 30],
        [20, 30],
        [21, 30],
        [22, 30],
        [23, 30],
        [24, 30],
        [25, 30],
        [26, 30],
        [27, 30],
        [28, 30],
        [29, 30],
        [30, 30],
      ],
    },
    {
      data: [
        [0, 800],
        [1, 600],
        [2, 500],
        [3, 400],
        [4, 600],
        [5, 500],
        [6, 800],
        [7, 1000],
        [8, 900],
        [9, 1100],
        [10, 1500],
        [11, 1700],
        [12, 1400],
        [13, 1300],
        [14, 1500],
        [15, 1300],
        [16, 1200],
        [17, 1000],
        [18, 1100],
        [19, 800],
        [20, 500],
        [21, 300],
        [22, 500],
        [23, 600],
        [24, 500],
        [25, 600],
        [26, 800],
        [27, 1000],
        [28, 900],
        [29, 800],
        [30, 500],
      ],
    },
  ];

  const optionFour = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false },
    },
    grid: {
      borderColor: "rgba(72,94,144, 0.07)",
      padding: {
        top: -20,
        left: 5,
      },
    },
    states: states,
    colors: ["#506fd9", "#fff", "#85b6fe"],
    plotOptions: {
      bar: { columnWidth: "35%" },
    },
    stroke: {
      curve: "straight",
      lineCap: "square",
      width: 0,
    },
    xaxis: {
      type: "numeric",
      tickAmount: 6,
      decimalsInFloat: 0,
      labels: {
        style: {
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      max: 4000,
      tickAmount: 8,
      labels: {
        style: {
          colors: ["#a2abb5"],
          fontSize: "11px",
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    fill: { opacity: 1 },
    legend: { show: false },
  };

  const seriesFive = [
    {
      name: "Growth",
      data: dp1,
    },
    {
      name: "Actual",
      data: dp2,
    },
  ];

  const optionFive = {
    chart: {
      parentHeightOffset: 0,
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#9dc3fc", "#506fd9"],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(72,94,144, 0.07)",
      padding: {
        top: -20,
        bottom: 0,
        left: 20,
      },
      yaxis: {
        lines: { show: false },
      },
    },
    stroke: {
      curve: "smooth",
      width: 1.5,
    },
    fill: {
      colors: ["#fff", "#81adee"],
      type: ["solid", "gradient"],
      opacity: 1,
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0.65,
      },
    },
    legend: { show: false },
    tooltip: { enabled: false },
    yaxis: {
      max: 200,
      tickAmount: 6,
      show: false,
    },
    xaxis: {
      type: "numeric",
      tickAmount: 11,
      labels: {
        style: {
          colors: "#6e7985",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
    },
  };

  const regStyle = {
    selected: {
      fill: "#506fd9",
    },
    initial: {
      fill: "#d9dde7",
    },
  };

  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);

  const switchSkin = (skin) => {
    if (skin === "dark") {
      const btnWhite = document.getElementsByClassName("btn-white");

      for (const btn of btnWhite) {
        btn.classList.add("btn-outline-primary");
        btn.classList.remove("btn-white");
      }
    } else {
      const btnOutlinePrimary = document.getElementsByClassName(
        "btn-outline-primary"
      );

      for (const btn of btnOutlinePrimary) {
        btn.classList.remove("btn-outline-primary");
        btn.classList.add("btn-white");
      }
    }
  };

  switchSkin(skin);

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">
                <Link href="#">Dashboard</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                On-going service
              </li>
            </ol>
            <h4 className="main-title mb-0">Dashboard</h4>
          </div>

          <Nav as="nav" className="nav-icon nav-icon-lg">
            <OverlayTrigger overlay={<Tooltip>Share</Tooltip>}>
              <Nav.Link href="">
                <i className="ri-share-line"></i>
              </Nav.Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Print</Tooltip>}>
              <Nav.Link href="">
                <i className="ri-printer-line"></i>
              </Nav.Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Report</Tooltip>}>
              <Nav.Link href="">
                <i className="ri-bar-chart-2-line"></i>
              </Nav.Link>
            </OverlayTrigger>
          </Nav>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Sessions By Location</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table className="table-four table-bordered">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th colSpan="3">Acquisition</th>
                  <th colSpan="3">Behavior</th>
                  <th colSpan="3">Conversions</th>
                </tr>
                <tr>
                  <th>Source</th>
                  <th>Users</th>
                  <th>New Users</th>
                  <th>Sessions</th>
                  <th>Bounce Rate</th>
                  <th>Pages/Session</th>
                  <th>Avg. Session</th>
                  <th>Transactions</th>
                  <th>Revenue</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    source: "Organic search",
                    users: "350",
                    new: "22",
                    sessions: "5,628",
                    bounce: "25.60%",
                    pages: "1.92",
                    avg: "00:01:05",
                    trans: "340,103",
                    revenue: "$2.65M",
                    rate: "4.50%",
                  },
                  {
                    source: "Social media",
                    users: "276",
                    new: "18",
                    sessions: "5,100",
                    bounce: "23.66%",
                    pages: "1.89",
                    avg: "00:01:03",
                    trans: "321,960",
                    revenue: "$2.51M",
                    rate: "4.36%",
                  },
                  {
                    source: "Referral",
                    users: "246",
                    new: "17",
                    sessions: "4,880",
                    bounce: "26.22%",
                    pages: "1.78",
                    avg: "00:01:09",
                    trans: "302,767",
                    revenue: "$2.1M",
                    rate: "4.34%",
                  },
                  {
                    source: "Email",
                    users: "187",
                    new: "14",
                    sessions: "4,450",
                    bounce: "24.97%",
                    pages: "1.35",
                    avg: "00:02:07",
                    trans: "279,300",
                    revenue: "$1.86M",
                    rate: "3.99%",
                  },
                  {
                    source: "Other",
                    users: "125",
                    new: "13",
                    sessions: "3,300",
                    bounce: "21.67%",
                    pages: "1.14",
                    avg: "00:02:01",
                    trans: "240,200",
                    revenue: "$1.51M",
                    rate: "2.84%",
                  },
                ].map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Link to="">{item.source}</Link>
                    </td>
                    <td>350</td>
                    <td>22</td>
                    <td>5,628</td>
                    <td>25.60%</td>
                    <td>1.92</td>
                    <td>00:01:05</td>
                    <td>340,103</td>
                    <td>$2.65M</td>
                    <td>4.50%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
