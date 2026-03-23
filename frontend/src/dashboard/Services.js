import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import Chat from "../apps/Chat";
import { Card, Table, Pagination, Offcanvas, Button, Form, Row, Col, Accordion, Badge } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import PaymentActDocument from "../documentTemplates/PaymentAct";
import { useAuth } from "../AuthContext";

import { FaEdit, FaTrash, FaPhone, FaChargingStation, FaSearch } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_APP_SOCKET}`);

const statusConfig = {
  "Taisoma vietoje": { bg: "primary", label: "Taisoma vietoje" },
  "Neišsiųsta":      { bg: "warning", label: "Neišsiųsta" },
  "Taisoma kitur":   { bg: "info",    label: "Taisoma kitur" },
  "Sutaisyta, pranešta": { bg: "success", label: "Sutaisyta, pranešta" },
  "Atsiskaityta":    { bg: "dark",    label: "Atsiskaityta" },
  "jb":              { bg: "secondary", label: "JB" },
};

export default function Services() {
  const { filter = "all" } = useParams();
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);
  const [data, setData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [paymentAct, setPaymentAct] = useState(null);

  const { nickname } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 30;

  const [searchPhone, setSearchPhone] = useState("");
  const [searchServiceId, setSearchServiceId] = useState("");

  const [showChat, setShowChat] = useState(false);

  const switchSkin = (skin) => {
    if (skin === "dark") {
      const btnWhite = document.getElementsByClassName("btn-white");
      for (const btn of btnWhite) {
        btn.classList.add("btn-outline-primary");
        btn.classList.remove("btn-white");
      }
    } else {
      const btnOutlinePrimary = document.getElementsByClassName("btn-outline-primary");
      for (const btn of btnOutlinePrimary) {
        btn.classList.remove("btn-outline-primary");
        btn.classList.add("btn-white");
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchPhone, searchServiceId]);

  const handleDelete = (serviceId) => {
    const isConfirmed = window.confirm("Ar tikrai ištrinti šį servisą?");

    if (isConfirmed) {
      axios
        .delete(
          `${import.meta.env.VITE_APP_URL}/api/dashboard/services/${serviceId}`,
          { withCredentials: true }
        )
        .then((response) => {
          setData(data.filter((item) => item.id !== serviceId));
        })
        .catch((error) => {
          const msg = error.response?.data?.error || error.response?.data?.message || "Nepavyko ištrinti serviso";
          alert(msg);
        });
    }
  };

  switchSkin(skin);

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  useEffect(() => {
    const searchParams = {
      page: currentPage,
      limit,
    };

    if (searchPhone.trim()) {
      searchParams.phone = searchPhone.trim();
    }

    if (searchServiceId.trim()) {
      searchParams.serviceId = searchServiceId.trim();
    }

    axios
      .get(`${import.meta.env.VITE_APP_URL}/api/dashboard/services/${filter}`, {
        params: searchParams,
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data.services);
        setTotalPages(response.data.pagination.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [filter, currentPage, searchPhone, searchServiceId]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenChat = (itemId) => {
    setSelectedItemId(itemId);
    setShowChat(true);
  };

  const printPaymentAct = (index) => {
    setPaymentAct(data[index]);
    setTimeout(() => {
      const iframe = document.querySelector("iframe.payment-act");
      iframe.contentWindow.print();
    }, 600);
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { bg: "secondary", label: status || "—" };
    return <Badge bg={config.bg} className="px-2 py-1">{config.label}</Badge>;
  };

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Valdymo pultas {nickname}</h4>
          </div>
        </div>

        <Offcanvas show={showChat} onHide={() => setShowChat(false)} placement="start" style={{ width: "540px" }}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Komentarai — #{selectedItemId}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column p-0 overflow-hidden">
            {selectedItemId && <Chat itemId={selectedItemId} />}
          </Offcanvas.Body>
        </Offcanvas>

        <Accordion className="mt-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <FaSearch className="me-2" />
              Paieška
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefono numeris</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Įveskite telefono numerį"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Serviso ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Įveskite serviso ID"
                      value={searchServiceId}
                      onChange={(e) => setSearchServiceId(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchPhone("");
                      setSearchServiceId("");
                    }}
                  >
                    Išvalyti
                  </Button>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Aktyvūs servisai</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table hover className="table-sm align-middle">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Klientas</th>
                  <th>Įrenginys</th>
                  <th>Gedimas</th>
                  <th style={{ width: 80 }}>Kaina</th>
                  <th style={{ width: 160 }}>Būsena</th>
                  {filter !== "archive" && <th style={{ width: 70 }}>Info</th>}
                  <th style={{ width: 90 }}>Veiksmai</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={item.id}>
                    <td>
                      <Badge
                        bg="blue"
                        text="white"
                        className="border fw-semibold px-2 py-1 bg-blue border-radius-sm"
                        style={{ cursor: "pointer", fontSize: "0.85rem", backgroundColor: "#0084FF" }}
                        onClick={() => handleOpenChat(item.id)}
                      >
                        #{item.id}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-medium">{item.name}</div>
                      <small className="text-muted">{item.number}</small>
                    </td>
                    <td>
                      <div>{item.deviceModel}</div>
                      {item.devicePassword && (
                        <small className="text-muted">
                          <i className="ri-lock-2-line me-1"></i>{item.devicePassword}
                        </small>
                      )}
                    </td>
                    <td>{item.failure}</td>
                    <td className="fw-medium">€{parseFloat(item.price || 0).toFixed(2)}</td>
                    <td>
                      {filter === "archive" ? (
                        <span
                          onClick={() => printPaymentAct(i)}
                          style={{ cursor: "pointer" }}
                        >
                          {getStatusBadge(item.status)}
                          {item.paymentId && (
                            <Badge bg="success" className="px-2 py-1">
                              {item.paymentId}
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <>
                          {getStatusBadge(item.status)}
                          {item.paymentId && (
                            <Badge bg="success" className="px-2 py-1">Sumokėta</Badge>
                          )}
                        </>
                      )}
                    </td>
                    {filter !== "archive" && (
                      <td>
                        <FaChargingStation
                          className="me-2"
                          style={{ color: item.hasCharger ? "#33d685" : "#dc3545" }}
                        />
                        <FaPhone
                          style={{ color: item.isContacted ? "#33d685" : "#dc3545" }}
                        />
                      </td>
                    )}
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/edit/${item.id}`} className="btn btn-sm btn-outline-primary">
                          <FaEdit />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
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
            clientName={data.name}
          />
        </PDFViewer>
      )}
    </React.Fragment>
  );
}
