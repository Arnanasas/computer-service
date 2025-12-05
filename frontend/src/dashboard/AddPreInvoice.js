import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Button, Card, Form } from "react-bootstrap";
import * as formik from "formik";
import { PDFViewer } from "@react-pdf/renderer";

import PreInvoiceAct from "../documentTemplates/PreInvoiceAct";

export default function AddPreInvoice() {
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

  const getPreInvoice = () => {
    setShowPreInvoice(true);

    setTimeout(() => {
      const iframe = document.querySelector("iframe.acceptance-act");
      iframe.contentWindow.print();
    }, 600);
  };

  switchSkin(skin);


  const preInvoiceId = new Date().toISOString().split("T")[0].split("-").reduce((_,v,i,a)=>i? _+v : v.slice(2),"");

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  console.log(showPreInvoice);

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
            <Card.Title as="h6">Sukurti išankstinę sąskaitą faktūrą</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              initialValues={{
                price: "",
                preInvoiceId: preInvoiceId,
                clientType: "Privatus",
                companyName: "",
                companyCode: "",
                pvmCode: "",
                address: "",
                service: "Paslaugos",
              }}
              onSubmit={(values) => {
                setFormValues(values); 
                getPreInvoice();
              }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formPrice">
                    <Form.Label>Kaina</Form.Label>
                    <Form.Control
                      type="text"
                      name="price"
                      onChange={handleChange}
                      value={values.price}
                      className="form-control form-control-padding"
                    />
                  </Form.Group>

                  <Form.Group controlId="formPreInvoiceId">
                    <Form.Label>Išankstinės sąskaitos ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="preInvoiceId"
                      onChange={handleChange}
                      value={values.preInvoiceId}
                      className="form-control form-control-padding"
                    />
                  </Form.Group>

                  <Form.Group controlId="formClientType">
                    <Form.Label>Kliento tipas</Form.Label>
                    <Form.Select
                      name="clientType"
                      onChange={handleChange}
                      value={values.clientType}
                      className="form-control form-control-padding"
                    >
                      <option value="Privatus">Privatus</option>
                      <option value="Įmonė">Įmonė</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="formCompanyName">
                    <Form.Label>Įmonės pavadinimas</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      onChange={handleChange}
                      value={values.companyName}
                      className="form-control form-control-padding"
                    />
                  </Form.Group>

                  {values.clientType === "Įmonė" && (
                    <>
                      <Form.Group controlId="formCompanyCode">
                        <Form.Label>Įmonės kodas</Form.Label>
                        <Form.Control
                          type="text"
                          name="companyCode"
                          onChange={handleChange}
                          value={values.companyCode}
                          className="form-control form-control-padding"
                        />
                      </Form.Group>

                      <Form.Group controlId="formPvmCode">
                        <Form.Label>PVM kodas</Form.Label>
                        <Form.Control
                          type="text"
                          name="pvmCode"
                          onChange={handleChange}
                          value={values.pvmCode}
                          className="form-control form-control-padding"
                        />
                      </Form.Group>

                      <Form.Group controlId="formAddress">
                        <Form.Label>Adresas</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          onChange={handleChange}
                          value={values.address}
                          className="form-control form-control-padding"
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group controlId="formService">
                    <Form.Label>Paslaugos</Form.Label>
                    <Form.Control
                      type="text"
                      name="service"
                      onChange={handleChange}
                      value={values.service}
                      className="form-control form-control-padding"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Patvirtinti
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
