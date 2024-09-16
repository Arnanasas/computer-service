import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import axios from "axios";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
import { PDFViewer } from "@react-pdf/renderer";

import PreInvoiceAct from "../documentTemplates/PreInvoiceAct";

export default function AddPreInvoice() {
  const navigate = useNavigate();
  const { Formik } = formik;

  const [formValues, setFormValues] = useState({});

  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);

  const [showPreInvoice, setShowPreInvoice] = useState(false);

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
            <h4 className="main-title mb-0">Inventoriaus valdymas</h4>
          </div>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Pridėti inventorių</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              initialValues={{
                price: "15",
                preInvoiceId: "15",
                clientType: "Privatus",
                companyName: "MB Kalasta",
                companyCode: "123",
                pvmCode: "123",
                address: "123",
                service: "Paslaugos",
              }}
              onSubmit={(values) => {
                setFormValues(values); // Store form values in state
                setShowPreInvoice(true); // Show the PDFViewer
              }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formPrice">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="text"
                      name="price"
                      onChange={handleChange}
                      value={values.price}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formPreInvoiceId">
                    <Form.Label>Pre Invoice ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="preInvoiceId"
                      onChange={handleChange}
                      value={values.preInvoiceId}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formClientType">
                    <Form.Label>Client Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="clientType"
                      onChange={handleChange}
                      value={values.clientType}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formCompanyName">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      onChange={handleChange}
                      value={values.companyName}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formCompanyCode">
                    <Form.Label>Company Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyCode"
                      onChange={handleChange}
                      value={values.companyCode}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formPvmCode">
                    <Form.Label>PVM Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="pvmCode"
                      onChange={handleChange}
                      value={values.pvmCode}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      onChange={handleChange}
                      value={values.address}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group controlId="formService">
                    <Form.Label>Service</Form.Label>
                    <Form.Control
                      type="text"
                      name="service"
                      onChange={handleChange}
                      value={values.service}
                      className="form-control"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              )}
            </Formik>

            {showPreInvoice && (
              <PDFViewer className="acceptance-act d-none">
                <PreInvoiceAct
                  price={formValues.price}
                  preInvoiceId={formValues.preInvoiceId}
                  clientType={formValues.clientType}
                  companyName={formValues.companyName}
                  companyCode={formValues.companyCode}
                  pvmCode={formValues.pvmCode}
                  address={formValues.address}
                  service={formValues.service}
                />
              </PDFViewer>
            )}
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
