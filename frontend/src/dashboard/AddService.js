import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
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

// Device makes list with options for react-select
const deviceMakesOptions = [
  { value: "iPhone", label: "iPhone" },
  { value: "Samsung", label: "Samsung" },
  { value: "Huawei", label: "Huawei" },
  { value: "Xiaomi", label: "Xiaomi" },
  { value: "OnePlus", label: "OnePlus" },
  { value: "Google Pixel", label: "Google Pixel" },
  { value: "LG", label: "LG" },
  { value: "Sony", label: "Sony" },
  { value: "Nokia", label: "Nokia" },
  { value: "Motorola", label: "Motorola" },
  { value: "MacBook", label: "MacBook" },
  { value: "Dell", label: "Dell" },
  { value: "HP", label: "HP" },
  { value: "Lenovo", label: "Lenovo" },
  { value: "Asus", label: "Asus" },
  { value: "Acer", label: "Acer" },
  { value: "MSI", label: "MSI" },
  { value: "Toshiba", label: "Toshiba" },
  { value: "Surface", label: "Surface" },
  { value: "iPad", label: "iPad" },
  { value: "Stacionarus kompiuteris", label: "Stacionarus kompiuteris" },
  { value: "Kita", label: "Kita" }, 
];

// Device types that require password
const passwordRequiredDevices = [
  "iPhone", "Samsung", "Huawei", "Xiaomi", "OnePlus", "Google Pixel", 
  "LG", "Sony", "Nokia", "Motorola", "MacBook"
];

export default function AddService() {
  const navigate = useNavigate();
  const { Formik } = formik;

  const [selectedMake, setSelectedMake] = useState(null);
  const [modelInput, setModelInput] = useState("");

  // Dynamic validation schema that depends on selected device make
  const validationSchema = yup.object().shape({
    id: yup.string(),
    name: yup.string().required("Name is required"),
    number: yup
      .string()
      //   .matches(/^(\+)?(\d|\s|-)+$/, "Invalid number format")
      .required("Number is required"),
    deviceModel: yup.string().required("Device Model is required"),
    deviceSerial: yup.string(),
    devicePassword: yup.string().when([], {
      is: () => selectedMake && passwordRequiredDevices.includes(selectedMake.value),
      then: (schema) => schema.required("Password is required for this device type"),
      otherwise: (schema) => schema,
    }),
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

  // Function to combine make and model
  const combineDeviceModel = (make, model) => {
    if (!make || !model) return "";
    return `${make} ${model}`;
  };

  // Custom styles for react-select to match Bootstrap theme
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

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
            <Card.Title as="h6">Naujo serviso kūrimas</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values) => {
                console.log(values);
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_URL}/dashboard/services`,
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
              {({ handleSubmit, handleChange, values, touched, errors, setFieldValue }) => (
                <Form onSubmit={handleSubmit}>
                  {/* Main Information Section */}
                  <h6 className="mb-3 text-primary">Pagrindinė informacija</h6>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="name">Vardas Pavardė *</Form.Label>
                        <Form.Control
                          type="text"
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          isInvalid={!!errors.name}
                          isValid={touched.name && !errors.name}
                          tabIndex="1"
                          placeholder="Įveskite kliento vardą ir pavardę"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="number">Telefono numeris *</Form.Label>
                        <Form.Control
                          type="text"
                          id="number"
                          name="number"
                          value={values.number}
                          onChange={handleChange}
                          isInvalid={!!errors.number}
                          isValid={touched.number && !errors.number}
                          tabIndex="2"
                          placeholder="Įveskite telefono numerį"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.number}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <Form.Label>Įrenginio gamintojas *</Form.Label>
                            <Select
                              options={deviceMakesOptions}
                              value={selectedMake}
                              onChange={(selectedOption) => {
                                setSelectedMake(selectedOption);
                                const make = selectedOption ? selectedOption.value : "";
                                const combinedModel = combineDeviceModel(make, modelInput);
                                setFieldValue("deviceModel", combinedModel);
                              }}
                              placeholder="Ieškokite ir pasirinkite gamintoją..."
                              isClearable
                              isSearchable
                              styles={selectStyles}
                              tabIndex="3"
                            />
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="mb-3">
                            <Form.Label htmlFor="modelInput">Modelio pavadinimas *</Form.Label>
                            <Form.Control
                              type="text"
                              id="modelInput"
                              placeholder="pvz. 13 Pro Max, XPS 13, ThinkPad X1"
                              value={modelInput}
                              onChange={(e) => {
                                const model = e.target.value;
                                setModelInput(model);
                                const make = selectedMake ? selectedMake.value : "";
                                const combinedModel = combineDeviceModel(make, model);
                                setFieldValue("deviceModel", combinedModel);
                              }}
                              isInvalid={!!errors.deviceModel}
                              isValid={touched.deviceModel && !errors.deviceModel}
                              tabIndex="4"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.deviceModel}
                            </Form.Control.Feedback>
                          </div>
                        </Col>
                      </Row>
                      {values.deviceModel && (
                        <small className="text-muted">
                          Pilnas modelis: <strong>{values.deviceModel}</strong>
                        </small>
                      )}
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="failure">Gedimas *</Form.Label>
                        <Form.Control
                          type="text"
                          id="failure"
                          name="failure"
                          value={values.failure}
                          onChange={handleChange}
                          isInvalid={!!errors.failure}
                          isValid={touched.failure && !errors.failure}
                          tabIndex="5"
                          placeholder="Aprašykite gedimą"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.failure}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="price">Kaina (€) *</Form.Label>
                        <Form.Control
                          type="text"
                          id="price"
                          name="price"
                          value={values.price}
                          onChange={handleChange}
                          isInvalid={!!errors.price}
                          isValid={touched.price && !errors.price}
                          tabIndex="6"
                          placeholder="0.00"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>



                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="hasCharger">
                        <div className="mb-3">
                          <Form.Check
                            type="switch"
                            label="Pakrovėjas?"
                            id="hasCharger"
                            name="hasCharger"
                            checked={values.hasCharger}
                            onChange={handleChange}
                            isValid={touched.hasCharger && !errors.hasCharger}
                            tabIndex="7"
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
                            checked={values.isContacted}
                            onChange={handleChange}
                            isValid={touched.isContacted && !errors.isContacted}
                            tabIndex="8"
                          />
                        </div>
                      </Form.Group>
                    </Col>


                  </Row>

                  {/* Additional Information Section */}
                  <hr className="my-4" />
                  <h6 className="mb-3 text-secondary">Papildoma informacija</h6>
                  
                  <Row>
                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="id">Serviso ID</Form.Label>
                        <Form.Control
                          type="text"
                          id="id"
                          name="id"
                          value={values.id}
                          onChange={handleChange}
                          isValid={touched.id && !errors.id}
                          readOnly
                          className="bg-light"
                        />
                        <small className="text-muted">Automatiškai generuojamas</small>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="deviceSerial">Serijinis numeris</Form.Label>
                        <Form.Control
                          type="text"
                          id="deviceSerial"
                          name="deviceSerial"
                          value={values.deviceSerial}
                          onChange={handleChange}
                          isInvalid={!!errors.deviceSerial}
                          isValid={touched.deviceSerial && !errors.deviceSerial}
                          tabIndex="9"
                          placeholder="Jei žinomas"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.deviceSerial}
                        </Form.Control.Feedback>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mb-3">
                        <Form.Label htmlFor="devicePassword">
                          Slaptažodis
                          {selectedMake && passwordRequiredDevices.includes(selectedMake.value) && " *"}
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
                          tabIndex="10"
                          placeholder={
                            selectedMake && passwordRequiredDevices.includes(selectedMake.value) 
                              ? "Slaptažodis privalomas" 
                              : "Jei pateiktas"
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.devicePassword}
                        </Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <Form.Label>Būsena</Form.Label>
                        <Form.Control
                          as="select"
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          isValid={touched.status && !errors.status}
                          tabIndex="11"
                        >
                          <option>Taisoma vietoje</option>
                          <option>Neišsiųsta</option>
                          <option>Taisoma kitur</option>
                          <option>Sutaisyta, pranešta</option>
                          <option>Atsiskaityta</option>
                        </Form.Control>
                      </div>
                    </Col>
                  </Row>
                  

                  <Form.Control
                    type="hidden"
                    name="deviceModel"
                    value={values.deviceModel}
                  />
                  
                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" style={{justifyContent: "center", display: "flex"}} tabIndex="12" size="md">
                      <i className="ri-save-line me-2"></i>
                      Sukurti servisą
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      type="button" 
                      onClick={() => navigate("/services/all")}
                      tabIndex="13"
                    >
                      <i className="ri-close-line me-2"></i>
                      Atšaukti
                    </Button>
                  </div>
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
