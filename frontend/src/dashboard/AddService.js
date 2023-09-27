import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
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
} from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";

export default function AddService() {
  const navigate = useNavigate();
  const { Formik } = formik;

  const validationSchema = yup.object().shape({
    id: yup.string(),
    name: yup.string().required("Name is required"),
    number: yup
      .string()
      //   .matches(/^(\+)?(\d|\s|-)+$/, "Invalid number format")
      .required("Number is required"),
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
                  const response = await axios.post(
                    "http://localhost:4050/api/dashboard/services",
                    values,
                    {
                      withCredentials: true,
                    }
                  );
                  console.log(response.data);
                  navigate("/services/all");
                } catch (error) {
                  console.log(error);
                }
              }}
              on
              initialValues={{
                id: "0000000-0",
                name: "",
                number: "",
                deviceModel: "",
                deviceSerial: "",
                devicePassword: "",
                failure: "",
                price: "",
                hasCharger: false,
                status: "Taisoma vietoje",
                isContacted: false,
              }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
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
                          tabindex="2"
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
                          tabindex="1"
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
                          tabindex="3"
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
                          Įrenginio serijinis numeris
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="deviceSerial"
                          name="deviceSerial"
                          value={values.deviceSerial}
                          onChange={handleChange}
                          isInvalid={!!errors.deviceSerial}
                          isValid={touched.deviceSerial && !errors.deviceSerial}
                          tabindex="4"
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
                          tabindex="6"
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
                          tabindex="5"
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
                          tabindex="8"
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
                            tabindex="9"
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
                        value={values.hasCharger}
                        onChange={handleChange}
                        isValid={touched.hasCharger && !errors.hasCharger}
                        tabindex="10"
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
                        value={values.isContacted}
                        onChange={handleChange}
                        isValid={touched.isContacted && !errors.isContacted}
                        tabindex="11"
                      />
                    </div>
                  </Form.Group>
                  <Button variant="primary" type="submit" tabindex="12">
                    Patvirtinti
                  </Button>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
