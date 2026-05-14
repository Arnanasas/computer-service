import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import axios from "axios";
import { Button, Card, Col, Row, Form, Modal } from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
import toast from "react-hot-toast";

export default function QuickAdd() {
  const navigate = useNavigate();
  const { Formik } = formik;

  const [isPaymentModalShown, setIsPaymentModalShown] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [saleData, setSaleData] = useState({ itemName: "", price: "" });

  const itemValidationSchema = yup.object().shape({
    itemName: yup.string().required("Prekės pavadinimas privalomas"),
    price: yup
      .number()
      .typeError("Kaina turi būti skaičius")
      .positive("Kaina turi būti didesnė už 0")
      .required("Kaina privaloma"),
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
            <h4 className="main-title mb-0">Valdymo pultas</h4>
          </div>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Greitas pardavimas</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={itemValidationSchema}
              onSubmit={(values) => {
                setSaleData(values);
                setIsPaymentModalShown(true);
              }}
              initialValues={{ itemName: "", price: "" }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="itemName">
                          Parduodama prekė
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="itemName"
                          name="itemName"
                          value={values.itemName}
                          onChange={handleChange}
                          isInvalid={touched.itemName && !!errors.itemName}
                          isValid={touched.itemName && !errors.itemName}
                          tabIndex="1"
                          autoFocus
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.itemName}
                        </Form.Control.Feedback>
                      </div>

                      <div className="mb-3">
                        <Form.Label htmlFor="price">Kaina (€)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          id="price"
                          name="price"
                          value={values.price}
                          onChange={handleChange}
                          isInvalid={touched.price && !!errors.price}
                          isValid={touched.price && !errors.price}
                          tabIndex="2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" tabIndex="3">
                    Tęsti į mokėjimą
                  </Button>
                </Form>
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
            onSubmit={async (values, { setSubmitting }) => {
              setIsPaymentLoading(true);
              const apiBase = import.meta.env.VITE_APP_URL;
              try {
                const createRes = await axios.post(
                  `${apiBase}/api/dashboard/services`,
                  {
                    name: "Parduodama prekė",
                    number: "62222222",
                    deviceModel: "-",
                    deviceSerial: "-",
                    devicePassword: "-",
                    failure: saleData.itemName,
                    service: saleData.itemName,
                    hasCharger: false,
                    status: "Sutaisyta, pranešta",
                    isContacted: true,
                    clientType: values.clientType,
                    paymentMethod: values.paymentMethod,
                    paidDate: values.paidDate,
                    companyName: values.companyName,
                    companyCode: values.companyCode,
                    pvmCode: values.pvmCode,
                    address: values.address,
                  },
                  { withCredentials: true }
                );

                const created = createRes.data;
                const serviceId = created.id;

                await axios.put(
                  `${apiBase}/api/dashboard/services/${serviceId}`,
                  {
                    works: [
                      { name: saleData.itemName, price: Number(saleData.price) },
                    ],
                  },
                  { withCredentials: true }
                );

                const paymentPayload = {
                  serviceId,
                  needPVM: values.needPVM,
                };

                if (values.needPVM) {
                  paymentPayload.paymentMethod = values.paymentMethod;
                  paymentPayload.paidDate = values.paidDate;
                  paymentPayload.clientType = values.clientType;
                  paymentPayload.clientName = "Parduodama prekė";
                  paymentPayload.amount = Number(saleData.price);
                  paymentPayload.serviceName = saleData.itemName;
                  if (values.clientType === "juridinis") {
                    paymentPayload.companyName = values.companyName;
                    paymentPayload.companyCode = values.companyCode;
                    paymentPayload.pvmCode = values.pvmCode;
                    paymentPayload.address = values.address;
                  }
                }

                const paymentRes = await axios.post(
                  `${apiBase}/api/v2/payments`,
                  paymentPayload,
                  { withCredentials: true }
                );

                await axios.put(
                  `${apiBase}/api/dashboard/services/${serviceId}`,
                  { status: "Atsiskaityta" },
                  { withCredentials: true }
                );

                if (values.needPVM && paymentRes.data?.pdfUrl) {
                  window.open(
                    `${apiBase}${paymentRes.data.pdfUrl}`,
                    "_blank"
                  );
                }

                setIsPaymentModalShown(false);
                toast.success("Pardavimas sėkmingai įformintas!");
                navigate("/services/all");
              } catch (error) {
                const msg =
                  error.response?.data?.error ||
                  error.response?.data?.message ||
                  "Nepavyko išsaugoti mokėjimo";
                toast.error(msg);
              } finally {
                setIsPaymentLoading(false);
                setSubmitting(false);
              }
            }}
            initialValues={{
              paidDate: new Date().toLocaleDateString("lt-LT"),
              clientType: "privatus",
              paymentMethod: "kortele",
              companyName: "",
              companyCode: "",
              pvmCode: "",
              address: "",
              needPVM: false,
            }}
            enableReinitialize={true}
          >
            {({
              handleSubmit,
              handleChange,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <Form.Label htmlFor="paidDate">Mokėjimo data</Form.Label>
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
                      <Form.Label htmlFor="clientType">Kliento tipas</Form.Label>
                      <Form.Select
                        id="clientType"
                        name="clientType"
                        value={values.clientType}
                        onChange={(e) => {
                          const newClientType = e.target.value;
                          setFieldValue("clientType", newClientType);
                          const newNeedPVM =
                            newClientType === "juridinis" ||
                            values.paymentMethod === "grynais";
                          setFieldValue("needPVM", newNeedPVM);
                        }}
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
                        onChange={(e) => {
                          const newPaymentMethod = e.target.value;
                          setFieldValue("paymentMethod", newPaymentMethod);
                          const newNeedPVM =
                            values.clientType === "juridinis" ||
                            newPaymentMethod === "grynais";
                          setFieldValue("needPVM", newNeedPVM);
                        }}
                      >
                        <option value="kortele">Kortelė</option>
                        <option value="grynais">Grynais</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.paymentMethod}
                      </Form.Control.Feedback>
                    </div>

                    <div className="mb-3">
                      <Form.Label>Paslauga</Form.Label>
                      <Form.Control type="text" value={saleData.itemName} readOnly />
                    </div>
                  </Col>
                </Row>

                {values.clientType !== "privatus" && (
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="companyName">
                          Įmonės pavadinimas
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={values.companyName}
                          onChange={handleChange}
                          isInvalid={!!errors.companyName}
                          isValid={touched.companyName && !errors.companyName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.companyName}
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
                        <Form.Label htmlFor="companyCode">Įmonės kodas</Form.Label>
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

                <Form.Group controlId="needPVM">
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Reikia PVM SF?"
                      id="needPVM"
                      name="needPVM"
                      checked={values.needPVM}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? "Saugoma..." : "Išsaugoti ir spausdinti"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
