import React, { useEffect, useState, useCallback } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
 
import axios from "axios";
import { Button, Card, Col, Form, InputGroup, FormControl, Table, Row, Modal } from "react-bootstrap";
import * as yup from "yup";
import * as formik from "formik";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import AcceptanceActDocument from "../documentTemplates/AcceptanceAct";
import PaymentActDocument from "../documentTemplates/PaymentAct";
import BlackActDocument from "../documentTemplates/BlackAct";
import DoneJobActDocument from "../documentTemplates/DoneJobAct";
 
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
  const [isDoneJobActShown, setIsDoneJobActShown] = useState(false);
  const [isPaymentModalShown, setIsPaymentModalShown] = useState(false);
  const [isMessageModalShown, setIsMessageModalShown] = useState(false);

  const { Formik } = formik;

  // Works management state
  const [serviceWorks, setServiceWorks] = useState([]);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workQuery, setWorkQuery] = useState("");
  const [workResults, setWorkResults] = useState([]);
  const [workPage, setWorkPage] = useState(1);
  const [workLimit] = useState(10);
  const [workTotalPages, setWorkTotalPages] = useState(1);
  const [selectedWorks, setSelectedWorks] = useState([]); // {workId, name, defaultPrice, price}
  const [newWork, setNewWork] = useState({ name: "", description: "", defaultPrice: "" });
  const isArchived = ["Atsiskaityta", "jb"].includes((data && data.status) || "");

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
    price: yup.string().required("Price is required"),
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
      .get(`${process.env.REACT_APP_URL}/api/dashboard/service/${serviceId}`, {
        withCredentials: true,
      })
      .then((response) => {
        const serviceData = response.data;
        setData(serviceData);

        // Initialize works state
        setServiceWorks(Array.isArray(serviceData.works) ? serviceData.works : []);

        if (serviceData.usedParts && serviceData.usedParts.length > 0) {
          setSelectedParts(
            serviceData.usedParts.map((part) => ({
              _id: part._id,
              name: part.name,
              quantity: part.quantity,
              unitPrice: part.unitPrice,
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

  const getDoneJobAct = () => {
    setIsDoneJobActShown(true);
    console.log("Done job act shown");

    // Wait for the PDF iframe to load before printing to avoid blank pages
    setTimeout(() => {
      const iframe = document.querySelector("iframe.done-job-act");
      if (!iframe) return;

      const printNow = () => {
        if (iframe && iframe.contentWindow) {
          try { iframe.contentWindow.focus(); } catch (e) {}
          try { iframe.contentWindow.print(); } catch (e) {}
        }
      };

      const onLoad = () => {
        iframe.removeEventListener("load", onLoad);
        printNow();
      };

      try {
        iframe.addEventListener("load", onLoad);
      } catch (e) {}

      // Fallback: if already loaded or event didn't fire, try after a longer delay
      setTimeout(printNow, 1500);
    }, 100);
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
      await axios.post(
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
      await axios.post(
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
  const [query, setQuery] = useState({ name: "", category: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Other",
    price: "",
    quantity: 0,
  });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/dashboard/products`,
        {
          params: {
            name: query.name || undefined,
            category: query.category || undefined,
            page: 1,
            limit: 30,
          },
          withCredentials: true,
        }
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updatePartStock = async (partId, quantityChange) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL}/api/dashboard/products/quantity-change`,
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

  // Works: search catalog
  useEffect(() => {
    if (!showWorkModal) return;
    const fetchWorks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/dashboard/works`,
          {
            params: { q: workQuery, page: workPage, limit: workLimit },
            withCredentials: true,
          }
        );
        setWorkResults(response.data.works || []);
        setWorkTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error searching works:", error);
      }
    };
    fetchWorks();
  }, [showWorkModal, workQuery, workPage, workLimit]);

  const addWorkToSelection = (work) => {
    setSelectedWorks((prev) => {
      if (prev.find((w) => w.workId === work._id)) return prev;
      return [
        ...prev,
        {
          workId: work._id,
          name: work.name,
          defaultPrice: work.defaultPrice,
          price: "",
        },
      ];
    });
  };

  const removeWorkFromSelection = (workId) => {
    setSelectedWorks((prev) => prev.filter((w) => w.workId !== workId));
  };

  const submitSelectedWorks = async () => {
    if (selectedWorks.length === 0) return;
    try {
      const payload = {
        works: selectedWorks.map((w) => ({
          workId: w.workId,
          ...(w.price !== "" ? { price: Number(w.price) } : {}),
        })),
      };
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}/works`,
        payload,
        { withCredentials: true }
      );
      const updated = response.data;
      setServiceWorks(updated.works || []);
      setData((prev) => ({ ...prev, price: updated.price }));
      setSelectedWorks([]);
      setShowWorkModal(false);
    } catch (error) {
      console.error("Error adding works:", error);
    }
  };

  const removeWorkFromService = async (workId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}/works/${workId}`,
        { withCredentials: true }
      );
      const updated = response.data;
      setServiceWorks(updated.works || []);
      setData((prev) => ({ ...prev, price: updated.price }));
    } catch (error) {
      console.error("Error removing work:", error);
    }
  };

  const recalculatePrice = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}/recalculate-price`,
        {},
        { withCredentials: true }
      );
      const updated = response.data;
      setServiceWorks(updated.works || serviceWorks);
      setData((prev) => ({ ...prev, price: updated.price }));
    } catch (error) {
      console.error("Error recalculating price:", error);
    }
  };

  const createWork = async () => {
    if (!newWork.name || newWork.defaultPrice === "") return;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/dashboard/works`,
        {
          name: newWork.name,
          description: newWork.description,
          defaultPrice: Number(newWork.defaultPrice),
        },
        { withCredentials: true }
      );
      const created = response.data?.work || response.data;
      setNewWork({ name: "", description: "", defaultPrice: "" });
      // Prefill selection with created work for quick add
      if (created && created._id) {
        addWorkToSelection(created);
      }
      // Refresh results list
      setWorkQuery("");
      setWorkPage(1);
    } catch (error) {
      console.error("Error creating work:", error);
      alert("Nepavyko sukurti paslaugos");
    }
  };

  // When adding a part (reduce stock by 1)
  const addPart = (part) => {
    const isAlreadyAdded = selectedParts.some(
      (selectedPart) => selectedPart._id === part._id
    );
    if (!isAlreadyAdded) {
      const nextParts = [...selectedParts, { ...part, quantity: 1 }];
      setSelectedParts(nextParts);

      // Reduce stock in the backend by 1
      updatePartStock(part._id, -1);
      if (!isArchived) {
        syncUsedPartsToService(nextParts);
      }
    } else {
      alert("This part has already been added.");
    }
  };

  // When removing a part (restore stock by the part's quantity)
  const removePart = (id) => {
    const removedPart = selectedParts.find((part) => part._id === id);
    console.log("Removing part: ", removedPart);
    const nextParts = selectedParts.filter((part) => part._id !== id);
    setSelectedParts(nextParts);

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
    if (!isArchived) {
      syncUsedPartsToService(nextParts);
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updatedQuantity = Number(newQuantity);

    const nextParts = selectedParts.map((part) =>
      part._id === id ? { ...part, quantity: updatedQuantity } : part
    );
    setSelectedParts(nextParts);

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
    if (!isArchived) {
      syncUsedPartsToService(nextParts);
    }
  };

  const syncUsedPartsToService = async (parts) => {
    try {
      const usedParts = parts.map((p) => ({ _id: p._id, name: p.name, quantity: p.quantity }));
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}`,
        { usedParts },
        { withCredentials: true }
      );
      const updated = response.data;
      setData((prev) => ({ ...prev, price: updated.price, status: updated.status }));
      if (Array.isArray(updated.usedParts)) {
        setSelectedParts(
          updated.usedParts.map((part) => ({
            _id: part._id,
            name: part.name,
            quantity: part.quantity,
            unitPrice: part.unitPrice,
          }))
        );
      }
    } catch (error) {
      console.error("Error syncing used parts:", error);
    }
  };

  const createProduct = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/dashboard/products`,
        {
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity || 0),
        },
        { withCredentials: true }
      );
      const created = response.data?.product || response.data;
      setNewProduct({
        name: "",
        category: "Other",
        price: "",
        quantity: 0,
      });
      await fetchProducts();
      if (created && created._id) {
        addPart(created);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Nepavyko sukurti dalies");
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
                    `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}`,
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
                              value={data.price}
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
                      <Col md={6}>
                      <Form.Group controlId="hasCharger">
                      <div className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Pakrovėjas?"
                          id="hasCharger"
                          name="hasCharger"
                          checked={values.hasCharger}
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
                    </Form.Group></Col>
                    </Row>

                    <Row>
                      <Form.Label>
                        <b>Paslaugos (Works)</b>
                      </Form.Label>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Pavadinimas</th>
                            <th>Kaina (€)</th>
                            <th>Veiksmai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceWorks.map((w, idx) => (
                            <tr key={`${w.workId || idx}-${idx}`}>
                              <td>{w.name}</td>
                              <td>
                                <FormControl
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  defaultValue={parseFloat(w.price).toFixed(2)}
                                  onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val !== "" && !isNaN(val)) {
                                      try {
                                        axios
                                          .put(
                                            `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}/works/${idx}`,
                                            { price: Number(val) },
                                            { withCredentials: true }
                                          )
                                          .then((res) => {
                                            const updated = res.data;
                                            setServiceWorks(updated.works || []);
                                            setData((prev) => ({ ...prev, price: updated.price }));
                                          })
                                          .catch((err) => console.error("Error updating work price:", err));
                                      } catch {}
                                    }
                                  }}
                                />
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => removeWorkFromService(w.workId)}
                                >
                                  Pašalinti
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {serviceWorks.length === 0 && (
                            <tr>
                              <td colSpan={3} className="text-center text-muted">
                                Nėra pridėtų paslaugų
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                      <div className="d-flex gap-2 mb-3">
                        <Button variant="secondary" onClick={() => setShowWorkModal(true)}>
                          Pridėti paslaugą
                        </Button>
                        <Button variant="outline-primary" onClick={recalculatePrice}>
                          Perskaičiuoti kainą
                        </Button>
                        <div className="ms-auto fw-bold">
                          Iš viso: €{parseFloat(data.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </Row>

                    <Row>
                      <Form.Label htmlFor="#">
                        <b>Naudojamos dalys</b>
                      </Form.Label>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Dalies pavadinimas</th>
                            <th>Vnt. kaina (€)</th>
                            <th>Kiekis</th>
                            <th>Veiksmai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedParts.map((part) => (
                            <tr key={part._id}>
                              <td>{part._id}</td>
                              <td>{part.name}</td>
                              <td>{part.unitPrice !== undefined ? parseFloat(part.unitPrice).toFixed(2) : "-"}</td>
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
                      <div className="d-flex py-2">
                        <Button
                          variant="warning"
                          onClick={() => setShowProductModal(true)}
                          className="mt-2"
                        >
                          Pridėti dalis
                        </Button>
                      </div>
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
                    <Button
                      onClick={getDoneJobAct}
                      variant="secondary"
                      type="button"
                      className="mx-2"
                      disabled={!data.paidDate}
                    >
                      Atliktų darbų aktas
                    </Button>
                  </Form>

                  {isDoneJobActShown && (
                  <PDFViewer className="done-job-act d-none">
                    <DoneJobActDocument
                      serviceId={data.id || serviceId}
                      paidDate={data.paidDate || ""}
                      works={serviceWorks}
                      usedParts={Array.isArray(data.usedParts) ? data.usedParts : []}
                      failure={data.failure || ""}
                    />
                  </PDFViewer>
                )}

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
                  `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}`,
                  { ...values, status: "Atsiskaityta" },
                  {
                    withCredentials: true,
                  }
                );

                setData((data) => ({ ...data, ...values, ...response.data }));
                if (values.needPVM) {
                  printPaymentAct();
                }
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
              needPVM: Boolean(data.needPVM),
            }}
            enableReinitialize={true}
          >
            {({ handleSubmit, handleChange, values, touched, errors, setFieldValue }) => (
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
                      clientName={data.name}
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
          <h6 className="mb-2">Sukurti naują dalį</h6>
          <Form className="border rounded p-2 mb-3">
            <Row className="g-2">
              <Col md={4}>
                <Form.Control
                  placeholder="Pavadinimas*"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Other">Other</option>
                  <option value="Phone">Phone</option>
                  <option value="PC">PC</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Kiekis*"
                  min={0}
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  placeholder="Kaina*"
                  min={0}
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </Col>
              <Col md={12}>
                <small className="text-muted">Laukai: pavadinimas, kategorija (Other/Phone/PC), kaina, kiekis</small>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-2">
              <Button size="sm" variant="primary" onClick={createProduct} disabled={!newProduct.name || newProduct.price === ""}>
                Sukurti ir pridėti
              </Button>
            </div>
          </Form>

          <Form>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Search by name"
                onChange={(e) => setQuery({ ...query, name: e.target.value })}
              />
            </InputGroup>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Select value={query.category} onChange={(e) => setQuery({ ...query, category: e.target.value })}>
                  <option value="">Visos kategorijos</option>
                  <option value="Other">Other</option>
                  <option value="Phone">Phone</option>
                  <option value="PC">PC</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
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
      await axios.put(
                  `${process.env.REACT_APP_URL}/api/dashboard/services/${serviceId}`,
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

      {/* Works modal */}
      <Modal show={showWorkModal} onHide={() => setShowWorkModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Pridėti paslaugas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="mb-2">Sukurti naują paslaugą</h6>
          <Form className="border rounded p-2 mb-3">
            <Row className="g-2">
              <Col md={5}>
                <Form.Control
                  placeholder="Pavadinimas*"
                  value={newWork.name}
                  onChange={(e) => setNewWork({ ...newWork, name: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Aprašymas"
                  value={newWork.description}
                  onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Kaina*"
                  value={newWork.defaultPrice}
                  onChange={(e) => setNewWork({ ...newWork, defaultPrice: e.target.value })}
                />
              </Col>
              <Col md={1} className="d-grid">
                <Button size="sm" variant="primary" onClick={createWork} disabled={!newWork.name || newWork.defaultPrice === ""}>
                  Sukurti
                </Button>
              </Col>
            </Row>
          </Form>

          <Form className="mb-3">
            <InputGroup>
              <FormControl
                placeholder="Ieškoti pagal pavadinimą"
                value={workQuery}
                onChange={(e) => {
                  setWorkPage(1);
                  setWorkQuery(e.target.value);
                }}
              />
            </InputGroup>
          </Form>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Pavadinimas</th>
                <th>Numatyta kaina</th>
                <th>Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {workResults.map((w) => (
                <tr key={w._id}>
                  <td>{w.name}</td>
                  <td>€{parseFloat(w.defaultPrice).toFixed(2)}</td>
                  <td>
                    <Button variant="success" size="sm" onClick={() => addWorkToSelection(w)}>
                      Pridėti
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="small text-muted">Puslapis {workPage} iš {workTotalPages}</div>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={workPage <= 1}
                onClick={() => setWorkPage((p) => Math.max(1, p - 1))}
              >
                Atgal
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={workPage >= workTotalPages}
                onClick={() => setWorkPage((p) => p + 1)}
              >
                Pirmyn
              </Button>
            </div>
          </div>

          <h6 className="mt-3">Pasirinktos paslaugos</h6>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Pavadinimas</th>
                <th>Kaina (pasirinktinai)</th>
                <th>Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {selectedWorks.map((w) => (
                <tr key={w.workId}>
                  <td>{w.name}</td>
                  <td style={{ maxWidth: 140 }}>
                    <FormControl
                      type="number"
                      step="0.01"
                      min="0"
                      value={w.price}
                      onChange={(e) =>
                        setSelectedWorks((prev) =>
                          prev.map((x) =>
                            x.workId === w.workId ? { ...x, price: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => removeWorkFromSelection(w.workId)}>
                      Pašalinti
                    </Button>
                  </td>
                </tr>
              ))}
              {selectedWorks.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    Nepasirinkta
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWorkModal(false)}>
            Atšaukti
          </Button>
          <Button variant="primary" onClick={submitSelectedWorks} disabled={selectedWorks.length === 0}>
            Pridėti į servisą
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
