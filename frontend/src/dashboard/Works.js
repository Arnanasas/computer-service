import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import axios from "axios";
import * as yup from "yup";
import * as formik from "formik";
import { Card, Button, Table, Row, Col, Form } from "react-bootstrap";

export default function Works() {
  const { Formik } = formik;

  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/dashboard/works`, {
        withCredentials: true,
      });
      setWorks(Array.isArray(response.data) ? response.data : response.data?.works || []);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const validationSchema = yup.object().shape({
    name: yup.string().trim().required("Pavadinimas yra privalomas"),
    description: yup.string().default(""),
    defaultPrice: yup
      .number()
      .typeError("Turi būti skaičius")
      .min(0, "Negali būti neigiamas")
      .required("Kaina yra privaloma"),
  });

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Paslaugos</h4>
          </div>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Sukurti naują paslaugą</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values, { resetForm }) => {
                try {
                  await axios.post(`${process.env.REACT_APP_URL}/api/dashboard/works`, values, {
                    withCredentials: true,
                  });
                  resetForm();
                  fetchWorks();
                } catch (error) {
                  console.error("Error creating work:", error);
                }
              }}
              initialValues={{
                name: "",
                description: "",
                defaultPrice: "",
              }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="name">Pavadinimas *</Form.Label>
                        <Form.Control
                          type="text"
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          isInvalid={!!errors.name}
                          isValid={touched.name && !errors.name}
                          placeholder="pvz. Programinės įrangos diegimas"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="defaultPrice">Numatyta kaina (€) *</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          id="defaultPrice"
                          name="defaultPrice"
                          value={values.defaultPrice}
                          onChange={handleChange}
                          isInvalid={!!errors.defaultPrice}
                          isValid={touched.defaultPrice && !errors.defaultPrice}
                          placeholder="0.00"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.defaultPrice}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="description">Aprašymas</Form.Label>
                        <Form.Control
                          type="text"
                          id="description"
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          placeholder="Trumpas paslaugos aprašymas (nebūtina)"
                        />
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit">
                      <i className="ri-save-line me-2"></i>
                      Išsaugoti
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>

        <Card className="card-one mt-4">
          <Card.Header>
            <Card.Title as="h6">Paslaugų sąrašas</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="small text-muted">
                {isLoading ? "Kraunama..." : `Rasta: ${works.length}`}
              </div>
              <Button size="sm" variant="outline-secondary" onClick={fetchWorks}>
                Atnaujinti
              </Button>
            </div>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Pavadinimas</th>
                  <th>Aprašymas</th>
                  <th>Numatyta kaina (€)</th>
                </tr>
              </thead>
              <tbody>
                {works.map((work, idx) => (
                  <tr key={work._id || idx}>
                    <td>{work.name}</td>
                    <td>{work.description}</td>
                    <td>{typeof work.defaultPrice === "number" ? work.defaultPrice.toFixed(2) : work.defaultPrice}</td>
                  </tr>
                ))}
                {!isLoading && works.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      Nėra įrašų
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}


