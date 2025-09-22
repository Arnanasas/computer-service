import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import axios from "axios";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";

export default function EditInventory() {
  const navigate = useNavigate();
  const productId = window.location.pathname.split("/").pop();
  const { Formik } = formik;

  const validationSchema = yup.object().shape({
    name: yup.string().required("Product name is required"),
    category: yup
      .string()
      .oneOf(["Other", "Phone", "PC"], "Invalid category")
      .required("Category is required"),
    price: yup.number().required("Price is required").min(0, "Price can't be negative"),
    quantity: yup.number().min(0, "Quantity can't be negative").required("Quantity is required"),
  });

  const [data, setData] = useState({
    name: "",
    category: "Other",
    price: 0,
    quantity: 0,
  });

  // Predefined categories and locations
  const categories = [
    { value: "Telefonai", label: "Telefonai" },
    { value: "Kompiuteriai", label: "Kompiuteriai" },
    { value: "Plansetes", label: "Plansetes" },
  ];

  const locations = [{ value: "Kalvariju", label: "Kalvariju" }];

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
      .get(`${process.env.REACT_APP_URL}/api/dashboard/products/${productId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
      });

    console.log(data);
  }, [productId]);

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
            <Card.Title as="h6">Redaguoti inventorių inventorių</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                try {
                  const response = await axios.put(
                    `${process.env.REACT_APP_URL}/api/dashboard/products/${productId}`,
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
                name: data.name || "",
                category: data.category || "Other",
                price: data.price ?? 0,
                quantity: data.quantity ?? 0,
              }}
              enableReinitialize={true}
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

                    
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="quantity">Kiekis</Form.Label>
                        <Form.Control
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={values.quantity}
                          onChange={handleChange}
                          isInvalid={!!errors.quantity}
                          isValid={touched.quantity && !errors.quantity}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.quantity}
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
                          <option value="Other">Other</option>
                          <option value="Phone">Phone</option>
                          <option value="PC">PC</option>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
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
