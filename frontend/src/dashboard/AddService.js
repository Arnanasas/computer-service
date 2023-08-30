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
  ProgressBar,
  Row,
  Table,
  Tooltip,
  Form,
} from "react-bootstrap";
import { dp1, dp2 } from "../data/DashboardData";
import ReactApexChart from "react-apexcharts";
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";
import data from "../routes/dummydata";
import { FaEdit, FaTrash, FaPhone, FaChargingStation } from "react-icons/fa"; // Import React icons
import * as yup from "yup";
import * as formik from "formik";

export default function AddService() {
  const { Formik } = formik;

  const validationSchema = yup.object().shape({
    id: yup.number(),
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
                } catch (error) {
                  console.log(error);
                }
              }}
              on
              initialValues={{
                id: "2345678",
                name: "Jane Doe",
                number: "987-654-3210",
                deviceModel: "Desktop Elite",
                deviceSerial: "DE987654",
                devicePassword: "mypassword",
                failure: "asd",
                price: "$80",
                hasCharger: true,
                status: "Pending",
                isContacted: true,
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
                        <Form.Label htmlFor="name">Name</Form.Label>
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
                        <Form.Label htmlFor="number">Number</Form.Label>
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
                          Device Model
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
                          Device Serial
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="deviceSerial"
                          name="deviceSerial"
                          value={values.deviceSerial}
                          onChange={handleChange}
                          isInvalid={!!errors.deviceSerial}
                          isValid={touched.deviceSerial && !errors.deviceSerial}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.deviceSerial}
                        </Form.Control.Feedback>
                      </div>

                      <div className="mb-3">
                        <Form.Label htmlFor="devicePassword">
                          Device password
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
                        <Form.Label htmlFor="failure">Failure</Form.Label>
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
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                          as="select"
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          isValid={touched.status && !errors.status}
                        >
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                        </Form.Control>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <div className="mb-3">
                          <Form.Label htmlFor="price">Price</Form.Label>
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
                        label="Has Charger"
                        id="hasCharger"
                        name="hasCharger"
                        value={values.hasCharger}
                        onChange={handleChange}
                        isValid={touched.hasCharger && !errors.hasCharger}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="isContacted">
                    <div className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Is Contacted"
                        id="isContacted"
                        name="isContacted"
                        value={values.isContacted}
                        onChange={handleChange}
                        isValid={touched.isContacted && !errors.isContacted}
                      />
                    </div>
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
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
