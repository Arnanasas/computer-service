import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import axios from "axios";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
 

export default function AddInventory() {
  const navigate = useNavigate();
  const { Formik } = formik;

  // Update the validation schema for inventory fields
  const validationSchema = yup.object().shape({
    name: yup.string().required("Product name is required"),
    description: yup.string(),
    model: yup.string().required("Model is required"),
    category: yup.string().required("Category is required"),
    stock: yup
      .number()
      .required("Stock is required")
      .min(0, "Stock can't be negative"),
    price: yup
      .number()
      .required("Price is required")
      .min(0, "Price can't be negative"),
    ourPrice: yup
      .number()
      .required("Bought price is required")
      .min(0, "Our price can't be negative"),
    partNumber: yup.string().required("Part number is required"),
    storage: yup.string().required("Storage location is required"),
  });

  // Predefined categories and locations
  const categories = [
    { value: "Telefonai", label: "Telefonai" },
    { value: "Kompiuteriai", label: "Kompiuteriai" },
    { value: "Plansetes", label: "Plansetes" },
    // Add more categories as needed
  ];

  const locations = [
    { value: "Kalvariju", label: "Kalvariju" },
    { value: "store-1", label: "Store 1" },
    { value: "store-2", label: "Store 2" },
  ];

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
            <h4 className="main-title mb-0">Inventoriaus valdymas</h4>
          </div>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Pridėti inventorių</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_URL}/api/dashboard/products`, // Update endpoint for inventory
                    values,
                    {
                      withCredentials: true,
                    }
                  );
                  console.log(response.data);
                  navigate("/inventory"); // Navigate to inventory page after success
                } catch (error) {
                  console.log(error);
                }
              }}
              initialValues={{
                name: "",
                description: "",
                model: "",
                category: "Telefonai",
                stock: 1,
                price: "15",
                ourPrice: "10",
                partNumber: "",
                storage: "Kalvariju",
              }}
            >
              {({ handleSubmit, handleChange, values, touched, errors }) => (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="name">Produktas</Form.Label>
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
                        <Form.Label htmlFor="description">Aprašymas</Form.Label>
                        <Form.Control
                          type="text"
                          id="description"
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          isInvalid={!!errors.description}
                          isValid={touched.description && !errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.description}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="model">Modelis</Form.Label>
                        <Form.Control
                          type="text"
                          id="model"
                          name="model"
                          value={values.model}
                          onChange={handleChange}
                          isInvalid={!!errors.model}
                          isValid={touched.model && !errors.model}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.model}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="stock">Kiekis</Form.Label>
                        <Form.Control
                          type="number"
                          id="stock"
                          name="stock"
                          value={values.stock}
                          onChange={handleChange}
                          isInvalid={!!errors.stock}
                          isValid={touched.stock && !errors.stock}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.stock}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="category">Kategorija</Form.Label>
                        <Form.Control
                          as="select"
                          id="category"
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                          isInvalid={!!errors.category}
                          isValid={touched.category && !errors.category}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="partNumber">
                          Dalies numeris
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="partNumber"
                          name="partNumber"
                          value={values.partNumber}
                          onChange={handleChange}
                          isInvalid={!!errors.partNumber}
                          isValid={touched.partNumber && !errors.partNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.partNumber}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="price">Kaina</Form.Label>
                        <Form.Control
                          type="number"
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
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="ourPrice">
                          Pirkimo kaina
                        </Form.Label>
                        <Form.Control
                          type="number"
                          id="ourPrice"
                          name="ourPrice"
                          value={values.ourPrice}
                          onChange={handleChange}
                          isInvalid={!!errors.ourPrice}
                          isValid={touched.ourPrice && !errors.ourPrice}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.ourPrice}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="location">Lokacija</Form.Label>
                        <Form.Control
                          as="select"
                          id="location"
                          name="location"
                          value={values.location}
                          onChange={handleChange}
                          isInvalid={!!errors.location}
                          isValid={touched.location && !errors.location}
                        >
                          <option value="Kalvariju">Kalvariju</option>
                          {locations.map((loc) => (
                            <option key={loc.value} value={loc.value}>
                              {loc.label}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.location}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    onClick={handleSubmit}
                  >
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
