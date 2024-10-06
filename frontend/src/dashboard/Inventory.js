import React, { useEffect, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Table,
  Pagination,
} from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

import { FaEdit, FaTrash } from "react-icons/fa"; // Import React icons
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_SOCKET}`);

export default function Inventory() {
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { logout } = useAuth();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Update the current page
    fetchProducts(pageNumber); // Fetch products for the selected page
  };

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

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storages, setStorages] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [storageFilter, setStorageFilter] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [name, setName] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
    if (!csvFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/dashboard/products/submit-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error submitting CSV file:", error);
    }
  };

  // Fetch products from API with filters
  const fetchProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/dashboard/products`,
        {
          params: {
            name: name || undefined,
            category: categoryFilter,
            storage: storageFilter,
            minStock,
            maxStock,
            page, // Pass the current page
            limit: 20, // Set the number of products per page
          },
          withCredentials: true,
        }
      );
      setProducts(response.data.products); // Set products
      setTotalPages(response.data.totalPages); // Update total pages from response
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/dashboard/categories`,
        {
          withCredentials: true,
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStorages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/dashboard/storages`,
        {
          withCredentials: true,
        }
      );
      setStorages(response.data);
    } catch (error) {
      console.error("Error fetching Storages:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStorages();
    fetchProducts(); // Fetch products on initial render
  }, [categoryFilter, storageFilter, minStock, maxStock]);

  const deleteProduct = (productId) => {
    const isConfirmed = window.confirm("Ar tikrai ištrinti šį produktą?");

    if (isConfirmed) {
      axios
        .delete(
          `${process.env.REACT_APP_URL}/dashboard/products/${productId}`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          fetchProducts();
        })
        .catch((error) => {
          console.error("Error deleting service:", error);
        });
    }
  };

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="filter-options mb-4">
          <Form onSubmit={handleFileSubmit}>
            <Form.Group controlId="formFile">
              <Form.Label>Upload CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit CSV
            </Button>
          </Form>

          <Form>
            <Row className="mb-3">
              {/* Category Select */}
              <Col>
                <Form.Group controlId="categoryFilter">
                  <Form.Label>Kategorija:</Form.Label>
                  <Form.Control
                    as="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Visos kategorijos</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              {/* Storage Select */}
              <Col>
                <Form.Group controlId="storageFilter">
                  <Form.Label>Sandėlys:</Form.Label>
                  <Form.Control
                    as="select"
                    value={storageFilter}
                    onChange={(e) => setStorageFilter(e.target.value)}
                  >
                    <option value="">Visi sandėliai</option>
                    {storages.map((storage) => (
                      <option key={storage._id} value={storage._id}>
                        {storage.locationName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              {/* Min Stock */}
              <Col>
                <Form.Group controlId="minStock">
                  <Form.Label>Min. Kiekis:</Form.Label>
                  <Form.Control
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="Minimalus kiekis"
                  />
                </Form.Group>
              </Col>

              {/* Max Stock */}
              <Col>
                <Form.Group controlId="maxStock">
                  <Form.Label>Max. kiekis:</Form.Label>
                  <Form.Control
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder="Maksimalus kiekis"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="name">
                  <Form.Label>Ieškoti pagal pavadinimą:</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pavadinimas"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Filter Button */}
            <Button variant="primary" onClick={fetchProducts}>
              Filtruoti
            </Button>
          </Form>
        </div>

        {/* Display filtered products */}
        <Card className="card-one mt-3">
          <Card.Header>
            <Card.Title as="h6">Inventorius</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Pavadinimas</th>
                  <th>Aprašymas</th>
                  <th>Kategorija</th>
                  <th>Kiekis</th>
                  <th>Kaina</th>
                  <th>Pirkimo kaina</th>
                  <th>Funkcijos</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.category?.name}</td>
                    <td>{product.stock}</td>
                    <td>{product.price}</td>
                    <td>{product.ourPrice}</td>
                    <td>
                      {" "}
                      <Link to={`/edit-inventory/${product._id}`}>
                        <FaEdit />
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => deleteProduct(product._id)}
                        className="mx-2"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}

              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
