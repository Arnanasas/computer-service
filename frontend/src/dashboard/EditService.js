import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Nav,
  OverlayTrigger,
  Row,
  Tooltip,
  Form,
  Modal,
} from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AcceptanceActDocument from "../documentTemplates/AcceptanceAct";
import PaymentActDocument from "../documentTemplates/PaymentAct";
import { useAuth } from "../AuthContext";

export default function EditService() {
  const navigate = useNavigate();
  const serviceId = window.location.pathname.split("/").pop();
  const [data, setData] = useState({
    id: "",
    name: "",
    number: "",
    deviceModel: "",
    deviceSerial: "",
    devicePassword: "",
    failure: "",
    price: "",
    hasCharger: false,
    status: "",
    isContacted: false,
  });
  const [isAcceptanceActShown, setIsAcceptanceActShown] = useState(false);
  const [isPaymentActShown, setIsPaymentActShown] = useState(false);
  const [isPaymentModalShown, setIsPaymentModalShown] = useState(false);

  const { Formik } = formik;

  const validationSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required("Name is required"),
    number: yup.string().required("Number is required"),
    deviceModel: yup.string().required("Device Model is required"),
    deviceSerial: yup.string(),
    devicePassword: yup.string(),
    failure: yup.string().required("Failure is required"),
    price: yup.number().required("Price is required"),
    hasCharger: yup.boolean().required("Has Charger is required"),
    status: yup.string().required("Status is required"),
    isContacted: yup.boolean().required("Is Contacted is required"),
  });

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

  useEffect(() => {
    // Fetch service data when component mounts
    axios
      .get(`${process.env.REACT_APP_URL}/dashboard/service/${serviceId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
      });
  }, [serviceId]);

  const getAcceptanceAct = () => {
    setIsAcceptanceActShown(true);

    setTimeout(() => {
      const iframe = document.querySelector("iframe.acceptance-act");
      iframe.contentWindow.print();
    }, 200);
  };

  const getPaymentAct = () => {
    setIsPaymentModalShown(true);
  };

  const printPaymentAct = () => {
    setIsPaymentActShown(true);

    setTimeout(() => {
      const iframe = document.querySelector("iframe.payment-act");
      iframe.contentWindow.print();
    }, 300);
  };

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
            <Card.Title as="h6">Now working on service</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                console.log(values);
                try {
                  const response = await axios.put(
                    `${process.env.REACT_APP_URL}/dashboard/services/${serviceId}`,
                    values,
                    {
                      withCredentials: true,
                    }
                  );
                  console.log(response.data);
                  navigate(-1);
                } catch (error) {
                  console.log(error);
                }
              }}
              //   on
              initialValues={{
                id: data.id || "", // Ensure these values are strings
                name: data.name || "",
                number: data.number || "",
                deviceModel: data.deviceModel || "",
                deviceSerial: data.deviceSerial || "",
                devicePassword: data.devicePassword || "",
                failure: data.failure || "",
                price: data.price || "",
                hasCharger: Boolean(data.hasCharger), // Convert to boolean
                status: data.status || "",
                isContacted: Boolean(data.isContacted), // Convert to boolean
              }}
              enableReinitialize={true}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="id">ID</Form.Label>
                          <Form.Control
                            type="text"
                            id="id"
                            name="id"
                            value={values.id}
                            onChange={handleChange}
                            isValid={touched.id && !errors.id}
                            readOnly
                          />
                        </div>

                        <div className="mb-3">
                          <Form.Label htmlFor="name">Vardas</Form.Label>
                          <Form.Control
                            type="text"
                            id="name"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                            isValid={touched.name && !errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="number">Tel. Nr.</Form.Label>
                          <Form.Control
                            type="text"
                            id="number"
                            name="number"
                            value={values.number}
                            onChange={handleChange}
                            isInvalid={!!errors.number}
                            isValid={touched.number && !errors.number}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.number}
                          </Form.Control.Feedback>
                        </div>

                        <div className="mb-3">
                          <Form.Label htmlFor="deviceModel">
                            Įrenginio modelis
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="deviceModel"
                            name="deviceModel"
                            value={values.deviceModel}
                            onChange={handleChange}
                            isInvalid={!!errors.deviceModel}
                            isValid={touched.deviceModel && !errors.deviceModel}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.deviceModel}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="deviceSerial">
                            Įrenginio serijinis kodas
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="deviceSerial"
                            name="deviceSerial"
                            value={values.deviceSerial}
                            onChange={handleChange}
                            isInvalid={!!errors.deviceSerial}
                            isValid={
                              touched.deviceSerial && !errors.deviceSerial
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.deviceSerial}
                          </Form.Control.Feedback>
                        </div>

                        <div className="mb-3">
                          <Form.Label htmlFor="devicePassword">
                            Slaptažodis
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="devicePassword"
                            name="devicePassword"
                            value={values.devicePassword}
                            onChange={handleChange}
                            isInvalid={!!errors.devicePassword}
                            isValid={
                              touched.devicePassword && !errors.devicePassword
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.devicePassword}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="failure">Gedimas</Form.Label>
                          <Form.Control
                            type="text"
                            id="failure"
                            name="failure"
                            value={values.failure}
                            onChange={handleChange}
                            isInvalid={!!errors.failure}
                            isValid={touched.failure && !errors.failure}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.failure}
                          </Form.Control.Feedback>
                        </div>

                        <div className="mb-3">
                          <Form.Label>Būsena</Form.Label>
                          <Form.Control
                            as="select"
                            name="status"
                            value={values.status}
                            onChange={handleChange}
                            isValid={touched.status && !errors.status}
                          >
                            <option>Taisoma vietoje</option>
                            <option>Neišsiųsta</option>
                            <option>Taisoma kitur</option>
                            <option>Laukiama klientų</option>
                            <option>Atsiskaityta</option>
                          </Form.Control>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <div className="mb-3">
                            <Form.Label htmlFor="price">Kaina</Form.Label>
                            <Form.Control
                              type="text"
                              id="price"
                              name="price"
                              value={values.price}
                              onChange={handleChange}
                              isInvalid={!!errors.price}
                              isValid={touched.price && !errors.price}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.price}
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group controlId="hasCharger">
                      <div className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Pakrovėjas?"
                          id="hasCharger"
                          name="hasCharger"
                          checked={values.hasCharger} // Use checked instead of value
                          onChange={(e) => handleChange(e, "hasCharger")}
                          isValid={touched.hasCharger && !errors.hasCharger}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group controlId="isContacted">
                      <div className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Susisiekta?"
                          id="isContacted"
                          name="isContacted"
                          checked={values.isContacted} // Use checked instead of value
                          onChange={(e) => handleChange(e, "isContacted")}
                          isValid={touched.isContacted && !errors.isContacted}
                        />
                      </div>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Patvirtinti
                    </Button>
                    <Button
                      onClick={getAcceptanceAct}
                      variant="secondary"
                      type="button"
                    >
                      Priėmimo kvitas
                    </Button>
                    <Button
                      onClick={getPaymentAct}
                      variant="secondary"
                      type="button"
                    >
                      Mokėjimo kvitas
                    </Button>
                  </Form>

                  {isAcceptanceActShown && (
                    <PDFViewer className="acceptance-act d-none">
                      <AcceptanceActDocument
                        repairNumber={serviceId}
                        name={values.name}
                        phoneNumber={values.number}
                        failure={values.failure}
                        hasCharger={values.hasCharger}
                      />
                    </PDFViewer>
                  )}
                </>
              )}
            </Formik>
          </Card.Body>
        </Card>

        <Footer />
      </div>

      <Modal
        className="modal-event"
        show={isPaymentModalShown}
        onHide={() => setIsPaymentModalShown(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Mokėjimo informacija</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            onSubmit={async (values) => {
              try {
                const response = await axios.put(
                  `${process.env.REACT_APP_URL}/dashboard/services/${serviceId}`,
                  values,
                  {
                    withCredentials: true,
                  }
                );

                setData((data) => ({ ...data, ...values, ...response.data }));
                printPaymentAct();
              } catch (error) {
                console.log(error);
              }
            }}
            //   on
            initialValues={{
              id: data.id || "", // Ensure these values are strings
              paidDate: data.paidDate
                ? new Date(data.paidDate).toLocaleDateString("lt-LT")
                : new Date().toLocaleDateString("lt-LT"),
              clientType: data.clientType || "privatus",
              paymentMethod: data.paymentMethod || "kortele",
              paymentId: data.paymentId,
              companyCode: data.companyCode || "",
              pvmCode: data.pvmCode || "",
              address: data.address || "",
              email: data.email || "",
              price: data.price,
              failure: data.failure,
            }}
            enableReinitialize={true}
          >
            {({ handleSubmit, handleChange, values, touched, errors }) => (
              <>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="paidDate">
                          Mokėjimo data
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="paidDate"
                          placeholder="Paid date"
                          value={values.paidDate}
                          onChange={handleChange}
                          isValid={touched.paidDate && !errors.paidDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.paidDate}
                        </Form.Control.Feedback>
                      </div>

                      <div className="mb-3">
                        <Form.Label htmlFor="clientType">
                          Kliento tipas
                        </Form.Label>
                        <Form.Select
                          id="clientType"
                          name="clientType"
                          value={values.clientType}
                          onChange={handleChange}
                        >
                          <option value="privatus">Privatus</option>
                          <option value="juridinis">Juridinis</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.clientType}
                        </Form.Control.Feedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="paymentMethod">
                          Mokėjimo būdas
                        </Form.Label>
                        <Form.Select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={values.paymentMethod}
                          onChange={handleChange}
                        >
                          <option value="kortele">Kortelė</option>
                          <option value="grynais">Grynais</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.paymentMethod}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  {values.clientType !== "privatus" && (
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="companyCode">
                            Įmonės kodas
                          </Form.Label>
                          <Form.Control
                            type="text"
                            id="companyCode"
                            name="companyCode"
                            value={values.companyCode}
                            onChange={handleChange}
                            isInvalid={!!errors.companyCode}
                            isValid={touched.companyCode && !errors.companyCode}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.companyCode}
                          </Form.Control.Feedback>
                        </div>

                        <div className="mb-3">
                          <Form.Label htmlFor="address">Adresas</Form.Label>
                          <Form.Control
                            type="text"
                            id="address"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            isInvalid={!!errors.address}
                            isValid={touched.address && !errors.address}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.address}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="email">El. paštas</Form.Label>
                          <Form.Control
                            type="text"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            isValid={touched.email && !errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </div>

                        <div className="mb-3">
                          <Form.Label htmlFor="pvmCode">PVM kodas</Form.Label>
                          <Form.Control
                            type="text"
                            id="pvmCode"
                            name="pvmCode"
                            value={values.pvmCode}
                            onChange={handleChange}
                            isInvalid={!!errors.pvmCode}
                            isValid={touched.pvmCode && !errors.pvmCode}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.pvmCode}
                          </Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Button variant="primary" type="submit">
                    Išsaugoti ir spausdinti
                  </Button>
                </Form>

                {isPaymentActShown && (
                  <PDFViewer className="payment-act d-none">
                    <PaymentActDocument
                      price={values.price}
                      paymentMethod={values.paymentMethod}
                      paymentId={values.paymentId}
                      clientType={values.clientType}
                      paidDate={values.paidDate}
                      companyCode={values.companyCode}
                      pvmCode={values.pvmCode}
                      address={values.address}
                      email={values.email}
                      failure={values.failure}
                    />
                  </PDFViewer>
                )}
              </>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
