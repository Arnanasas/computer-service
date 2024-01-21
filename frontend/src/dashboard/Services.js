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
import { PDFViewer } from "@react-pdf/renderer";
import PaymentActDocument from "../documentTemplates/PaymentAct";
import { useAuth } from "../AuthContext";

import { FaEdit, FaTrash, FaPhone, FaChargingStation } from "react-icons/fa"; // Import React icons
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_SOCKET}`);

export default function Services() {
  const { filter = "all" } = useParams();
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);
  const [data, setData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [paymentAct, setPaymentAct] = useState(null);

  const { logout } = useAuth();

  // Socket comment
  useEffect(() => {
    socket.on("receive-notification", () => {
      alert("A user wrote a new comment!");
    });

    return () => {
      socket.off("receive-notification");
    };
  }, []);

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
      .delete(`${process.env.REACT_APP_URL}/dashboard/services/${serviceId}`, {
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
      .get(`${process.env.REACT_APP_URL}/dashboard/services/${filter}`, {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data); // Update state with fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        logout();
      });
  }, [filter]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = (itemId) => {
    setShow(true);
    setSelectedItemId(itemId);
  };

  const printPaymentAct = (index) => {
    console.log("test");
    setPaymentAct(data[index]);
    setTimeout(() => {
      const iframe = document.querySelector("iframe.payment-act");
      iframe.contentWindow.print();
    }, 600);
  };

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Valdymo pultas</h4>
          </div>
        </div>

        <Modal
          show={show}
          onHide={handleClose}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Header closeButton>
            <Modal.Title>Komentarai</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Chat itemId={selectedItemId}></Chat>
          </Modal.Body>
        </Modal>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Aktyvūs servisai</Card.Title>
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
                  <th>Būsena</th>
                  {filter !== "archive" && <th>Info</th>}
                  <th>Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={item.id}>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleShow(item.id)}
                      >
                        {item.id}
                      </Button>
                    </td>
                    <td>{item.name}</td>
                    <td>{item.number}</td>
                    <td>{item.deviceModel}</td>
                    <td>{item.deviceSerial}</td>
                    <td>{item.failure}</td>
                    <td>{item.price}</td>
                    <td>
                      {filter === "archive" ? (
                        <div>
                          <p
                            onClick={() => printPaymentAct(i)}
                            className="cursor-pointer"
                          >
                            <a href="#" className="pe-none">
                              {item.paymentMethod === "kortele" ? "CRD" : "GRN"}
                              -{item.paymentId}
                            </a>
                          </p>
                        </div>
                      ) : (
                        item.status
                      )}
                    </td>
                    {filter !== "archive" && (
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
                    )}
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

      {paymentAct && (
        <PDFViewer className="payment-act d-none">
          <PaymentActDocument
            price={paymentAct.price}
            paymentMethod={paymentAct.paymentMethod}
            paymentId={paymentAct.paymentId}
            clientType={paymentAct.clientType}
            paidDate={paymentAct.paidDate}
            companyName={paymentAct.companyName}
            companyCode={paymentAct.companyCode}
            pvmCode={paymentAct.pvmCode}
            address={paymentAct.address}
            service={paymentAct.service}
          />
        </PDFViewer>
      )}
    </React.Fragment>
  );
}
