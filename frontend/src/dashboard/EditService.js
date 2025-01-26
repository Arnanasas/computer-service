import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  FormControl,
  Table,
  OverlayTrigger,
  Row,
  Tooltip,
  Modal,
} from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AcceptanceActDocument from "../documentTemplates/AcceptanceAct";
import PaymentActDocument from "../documentTemplates/PaymentAct";
import BlackActDocument from "../documentTemplates/BlackAct";
import { useAuth } from "../AuthContext";
import { Toaster, toast } from "react-hot-toast";

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
  const [isMessageModalShown, setIsMessageModalShown] = useState(false);

  const { Formik } = formik;

  const validationSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required("Name is required"),
    number: yup
      .string()
      .required()
      .matches(/^6\d{7}$/, "Number must start with 6 and be 8 characters long"),
    deviceModel: yup.string().required("Device Model is required"),
    deviceSerial: yup.string(),
    devicePassword: yup.string(),
    failure: yup.string().required("Failure is required"),
    price: yup.number().required("Price is required"),
    profit: yup.number().required("Profit is required"),
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
        const serviceData = response.data;
        setData(serviceData);

        if (serviceData.usedParts && serviceData.usedParts.length > 0) {
          setSelectedParts(
            serviceData.usedParts.map((part) => ({
              _id: part._id,
              name: part.name,
              quantity: part.quantity,
            }))
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
      });
  }, [serviceId]);

  const getAcceptanceAct = () => {
    setIsAcceptanceActShown(true);
    console.log("Acceptance act shown");

    setTimeout(() => {
      const iframe = document.querySelector("iframe.acceptance-act");
      iframe.contentWindow.print();
    }, 600);
  };

  const getPaymentAct = () => {
    setIsPaymentModalShown(true);
  };

  const messageModal = useCallback(() => setIsMessageModalShown(true), []);

  const sendAccept = async (id, number) => {
    let values = {
      phoneNumber: data.number,
      serviceId: data.id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/send-msg/accept`,
        values,
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      if (error.response && error.response.data) {
        // If server provided a response error, return that message
        throw new Error(
          error.response.data.message || "Unknown error occurred"
        );
      } else {
        // If no response from server, throw general error
        throw new Error("Network error or server is unreachable");
      }
    }
  };

  const sendPickup = async (id, number) => {
    let values = {
      phoneNumber: data.number,
      serviceId: data.id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/send-msg/pick-up`,
        values,
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      if (error.response && error.response.data) {
        // If server provided a response error, return that message
        throw new Error(
          error.response.data.message || "Unknown error occurred"
        );
      } else {
        // If no response from server, throw general error
        throw new Error("Network error or server is unreachable");
      }
    }
  };

  const printPaymentAct = () => {
    setIsPaymentActShown(true);

    setTimeout(() => {
      const iframe = document.querySelector("iframe.payment-act");
      iframe.contentWindow.print();
    }, 600);
  };

  const printBlackAct = () => {
    setIsBlackActShown(true);

    setTimeout(() => {
      const iframe = document.querySelector("iframe.black-act");
      iframe.contentWindow.print();
    }, 600);
  };

  // Add Parts

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedParts, setSelectedParts] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState({
    name: "",
    category: "",
    storage: "",
    minStock: "",
    maxStock: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [query]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/dashboard/products`, // Update endpoint for inventory
        {
          params: {
            ...query,
            limit: 30,
          },
        },
        {
          withCredentials: true,
        }
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updatePartStock = async (partId, quantityChange) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/dashboard/products/quantity-change`,
        {
          partId,
          quantityChange, // Send part ID and quantity change to the backend
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating part stock:", error);
    }
  };

  // When adding a part (reduce stock by 1)
  const addPart = (part) => {
    const isAlreadyAdded = selectedParts.some(
      (selectedPart) => selectedPart._id === part._id
    );
    if (!isAlreadyAdded) {
      setSelectedParts((prevParts) => [...prevParts, { ...part, quantity: 1 }]);

      // Reduce stock in the backend by 1
      updatePartStock(part._id, -1);
    } else {
      alert("This part has already been added.");
    }
  };

  // When removing a part (restore stock by the part's quantity)
  const removePart = (id) => {
    const removedPart = selectedParts.find((part) => part._id === id);
    console.log("Removing part: ", removedPart);
    setSelectedParts(selectedParts.filter((part) => part._id !== id));

    // Increase stock in backend by the part's used quantity
    if (removedPart) {
      console.log(
        "Restoring stock for part:",
        removedPart._id,
        "Quantity:",
        removedPart.quantity
      );
      updatePartStock(removedPart._id, removedPart.quantity); // Restore stock
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updatedQuantity = Number(newQuantity);

    setSelectedParts((prevParts) =>
      prevParts.map((part) =>
        part._id === id ? { ...part, quantity: updatedQuantity } : part
      )
    );

    // Find the part in the list
    const partToUpdate = selectedParts.find((part) => part._id === id);
    if (partToUpdate) {
      if (updatedQuantity < 0) {
        alert("Quantity cannot be less than 0");
        return;
      }

      if (updatedQuantity > partToUpdate.stock) {
        alert(
          `Quantity cannot be greater than available stock (${partToUpdate.stock})`
        );
        return;
      }
      // Calculate the difference between the old and new quantities
      const quantityDifference = updatedQuantity - partToUpdate.quantity;

      // Update stock in the backend by the difference
      updatePartStock(id, -quantityDifference); // Negative when reducing stock
    }
  };

  // New state variables for BlackAct
  const [showBlackActModal, setShowBlackActModal] = useState(false);
  const [blackActData, setBlackActData] = useState(null);
  const [isBlackActShown, setIsBlackActShown] = useState(false);

  // Function to handle BlackAct button click
  const handleBlackAct = () => {
    setShowBlackActModal(true);
  };

  // Function to handle modal close
  const handleCloseBlackActModal = () => {
    setShowBlackActModal(false);
  };

  // Function to handle BlackAct generation (optional: trigger print)
  useEffect(() => {
    if (isBlackActShown) {
      // Optional: Trigger print dialog automatically
      setTimeout(() => {
        const iframe = document.querySelector("iframe.black-act");
        iframe.contentWindow.print();
      }, 600);

      printBlackAct();
      // Optionally, hide the PDFViewer after printing
      // setIsBlackActShown(false);
    }
  }, [isBlackActShown]);

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <Toaster />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Valdymo pultas</h4>
          </div>
        </div>

        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Serviso redagavimas</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                console.log(values);

                const partsUsed = selectedParts.map((part) => ({
                  _id: part._id, // Assuming part._id is the partId
                  name: part.name,
                  quantity: part.quantity,
                }));

                try {
                  const response = await axios.put(
                    `${process.env.REACT_APP_URL}/dashboard/services/${serviceId}`,
                    { ...values, usedParts: partsUsed },
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
                profit: data.profit || "",
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
                            onChange={(e) => {
                              handleChange(e);
                              setData((prevData) => ({
                                ...prevData, // Spread the existing fields
                                number: e.target.value, // Update the number field
                              }));
                            }}
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
                            <option>Sutaisyta, pranešta</option>
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
                          <div className="mb-3">
                            <Form.Label htmlFor="price">Uždarbis</Form.Label>
                            <Form.Control
                              type="number"
                              id="profit"
                              name="profit"
                              value={values.profit}
                              onChange={handleChange}
                              isInvalid={!!errors.profit}
                              isValid={touched.profit && !errors.profit}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.profit}
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
                    <Row>
                      <Form.Label htmlFor="#">
                        <b>Naudojamos dalys</b>
                      </Form.Label>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Dalies pavadinimas</th>
                            <th>Lokacija</th>
                            <th>Kiekis</th>
                            <th>Veiksmai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedParts.map((part) => (
                            <tr key={part._id}>
                              <td>{part._id}</td>
                              <td>{part.name}</td>
                              <td>{part.storage?.locationName}</td>
                              <td>
                                <FormControl
                                  type="number"
                                  value={part.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      part._id,
                                      e.target.value
                                    )
                                  }
                                  min={1}
                                />
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  onClick={() => removePart(part._id)}
                                >
                                  Ištrinti
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Row>
                    <Button variant="primary" type="submit" className="mx-2">
                      Patvirtinti
                    </Button>
                    <Button
                      onClick={getAcceptanceAct}
                      variant="secondary"
                      type="button"
                      className="mx-2"
                    >
                      Priėmimo kvitas
                    </Button>
                    <Button
                      onClick={getPaymentAct}
                      variant="secondary"
                      type="button"
                      className="mx-2"
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
            <Row>
              <Col>
                <Button
                  onClick={() => {
                    messageModal();
                  }}
                  variant="danger"
                  type="button"
                  className="mx-2 my-2"
                >
                  Siųsti žinutę
                </Button>
                <Button
                  variant="warning"
                  onClick={() => setShowProductModal(true)}
                >
                  Pridėti dalis
                </Button>

                <Button
                  variant="primary"
                  type="button"
                  className="mx-2 my-2"
                  onClick={handleBlackAct}
                >
                  BlackAct
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Footer />
      </div>

      <Modal
        className="modal-event"
        show={isMessageModalShown}
        onHide={() => setIsMessageModalShown(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Informuoti klientą apie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Button
                onClick={() => {
                  toast.promise(sendAccept(data.id, data.number), {
                    loading: "Siunčiama žinutė...",
                    success: <b>Žinutė sėkmingai išsiųsta!</b>,
                    error: (error) => <b>{error.message}</b>,
                  });
                }}
                variant="success"
                type="button"
                className="mx-2"
              >
                Sėkmingai užregistruotas
              </Button>
            </Col>
          </Row>
          <Row className="my-2">
            <Col>
              <Button
                onClick={() => {
                  toast.promise(sendPickup(data.id, data.number), {
                    loading: "Siunčiama žinutė...",
                    success: <b>Žinutė sėkmingai išsiųsta!</b>,
                    error: (error) => <b>{error.message}</b>,
                  });
                }}
                variant="danger"
                type="button"
                className="mx-2"
              >
                Galite atsiimti įrenginį
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

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
                  { ...values, status: "Atsiskaityta" },
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
              companyName: data.companyName || "",
              companyCode: data.companyCode || "",
              pvmCode: data.pvmCode || "",
              address: data.address || "",
              service: data.service || "Kompiuterio remontas",
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

                      <div className="mb-3">
                        <Form.Label htmlFor="service">Paslauga</Form.Label>
                        <Form.Control
                          type="text"
                          id="service"
                          name="service"
                          value={values.service}
                          onChange={handleChange}
                          isInvalid={!!errors.service}
                          isValid={touched.service && !errors.service}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.service}
                        </Form.Control.Feedback>
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
                      companyName={values.companyName}
                      companyCode={values.companyCode}
                      pvmCode={values.pvmCode}
                      address={values.address}
                      service={values.service}
                    />
                  </PDFViewer>
                )}
              </>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Parts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Search by name"
                onChange={(e) => setQuery({ ...query, name: e.target.value })}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Category"
                onChange={(e) =>
                  setQuery({ ...query, category: e.target.value })
                }
              />
              <FormControl
                placeholder="Storage"
                onChange={(e) =>
                  setQuery({ ...query, storage: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Min Stock"
                type="number"
                onChange={(e) =>
                  setQuery({ ...query, minStock: e.target.value })
                }
              />
              <FormControl
                placeholder="Max Stock"
                type="number"
                onChange={(e) =>
                  setQuery({ ...query, maxStock: e.target.value })
                }
              />
            </InputGroup>
          </Form>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Category</th>
                <th>Storage</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category?.name}</td>
                  <td>{product.storage?.locationName}</td>
                  <td>{product.stock}</td>
                  <td>
                    <Button variant="success" onClick={() => addPart(product)}>
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowProductModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showBlackActModal}
        onHide={handleCloseBlackActModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Black Act Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              service: "Kompiuterio remontas",
              issueDescription:
                "Buvo rasta problema X, kurią reikia išspręsti. Problema išspręsta, kompiuteris veikia tinkamai.",
            }}
            validationSchema={yup.object({
              service: yup.string().required("Service is required"),
              issueDescription: yup
                .string()
                .required("Issue Description is required"),
            })}
            onSubmit={async (values) => {
              const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
              const combinedData = {
                price: data.price,
                serviceId: data.id,
                service: values.service,
                issueDescription: values.issueDescription,
                date: today,
                name: data.name,
              };
              try {
                const response = await axios.put(
                  `${process.env.REACT_APP_URL}/dashboard/services/${serviceId}`,
                  { ...data, status: "jb", paidDate: combinedData.date },
                  {
                    withCredentials: true,
                  }
                );
              } catch (error) {
                console.log(error);
              }
              setBlackActData(combinedData);
              setShowBlackActModal(false);
              printBlackAct();
            }}
          >
            {({ handleSubmit, handleChange, values, touched, errors }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="service" className="mb-3">
                  <Form.Label>Service</Form.Label>
                  <Form.Control
                    type="text"
                    name="service"
                    value={values.service}
                    onChange={handleChange}
                    isInvalid={touched.service && !!errors.service}
                    placeholder="Enter service"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.service}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="issueDescription" className="mb-3">
                  <Form.Label>Issue Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="issueDescription"
                    value={values.issueDescription}
                    onChange={handleChange}
                    isInvalid={
                      touched.issueDescription && !!errors.issueDescription
                    }
                    placeholder="Describe the issue"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.issueDescription}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Generate BlackAct
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {isBlackActShown && blackActData && (
        <PDFViewer
          className="black-act d-none"
          // style={{ width: "100%", height: "600px", marginTop: "20px" }}
        >
          <BlackActDocument
            name={blackActData.name}
            price={blackActData.price}
            issueDescription={blackActData.issueDescription}
            date={blackActData.date}
            service={blackActData.service}
            serviceId={blackActData.serviceId}
          />
        </PDFViewer>
      )}
    </React.Fragment>
  );
}
