import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import Chat from "../apps/Chat";
import {
  Card,
  Nav,
  OverlayTrigger,
  Table,
  Tooltip,
  Modal,
  Button,
} from "react-bootstrap";
import socketIOClient from "socket.io-client";

import { FaEdit, FaTrash, FaPhone, FaChargingStation } from "react-icons/fa"; // Import React icons
import axios from "axios";

export default function Services() {
  const { filter } = useParams();
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);
  const [data, setData] = useState([]);

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

  const handleDelete = (serviceId) => {
    axios
      .delete(`http://localhost:4050/api/dashboard/services/${serviceId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("Service deleted:", response.data.message);
        setData(data.filter((item) => item.id !== serviceId));
        // You might want to update your local state or fetch data again
      })
      .catch((error) => {
        console.error("Error deleting service:", error);
      });
  };

  switchSkin(skin);

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  useEffect(() => {
    // Fetch data from the API using Axios
    axios
      .get(`http://localhost:4050/api/dashboard/services/${filter}`, {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data); // Update state with fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [filter]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const socket = socketIOClient("http://localhost:4050");
    socket.on("newComment", (newComment) => {
      // Handle the new comment notification
      console.log("New Comment:", newComment);
      // You can update your UI or show a notification to the user
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection when the component unmounts
    };
  }, []);

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

        <Button variant="primary" onClick={handleShow}>
          Launch demo modal
        </Button>

        <Modal
          show={show}
          onHide={handleClose}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Chat></Chat>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Now working on service</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vardas</th>
                  <th>Numeris</th>
                  <th>Modelis</th>
                  <th>Serijinis nr.</th>
                  <th>Gedimas</th>
                  <th>Kaina</th>
                  {/* <th>Has Charger</th> */}
                  <th>Būsena</th>
                  {/* <th>Contacted</th> */}
                  <th>Info</th>
                  <th>Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.number}</td>
                    <td>{item.deviceModel}</td>
                    <td>{item.deviceSerial}</td>
                    <td>{item.failure}</td>
                    <td>{item.price}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.hasCharger ? (
                        <FaChargingStation
                          className="me-2"
                          style={{ color: "#33d685" }}
                        />
                      ) : (
                        <FaChargingStation
                          className="me-2"
                          style={{ color: "#dc3545" }}
                        />
                      )}
                      {item.isContacted ? (
                        <FaPhone
                          className="me-2"
                          style={{ color: "#33d685" }}
                        />
                      ) : (
                        <FaPhone
                          className="me-2"
                          style={{ color: "#dc3545" }}
                        />
                      )}
                    </td>
                    <td>
                      <Link to={`/edit/${item.id}`}>
                        <FaEdit />
                      </Link>
                      <button
                        className="btn btn-link text-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
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
