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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [name, setName] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleFileSubmit = async (event) => { event.preventDefault(); };

  // Fetch products from API with filters
  const fetchProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/dashboard/products`,
        {
          params: {
            name: name || undefined,
            category: categoryFilter || undefined,
            page,
            limit: 20,
          },
          withCredentials: true,
        }
      );
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {};
  const fetchStorages = async () => {};

  useEffect(() => {
    fetchCategories();
    fetchStorages();
    fetchProducts(); // Fetch products on initial render
  }, [categoryFilter]);

  const deleteProduct = (productId) => {
    const isConfirmed = window.confirm("Ar tikrai ištrinti šį produktą?");

    if (isConfirmed) {
      axios
        .delete(
          `${process.env.REACT_APP_URL}/api/dashboard/products/${productId}`,
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
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="categoryFilter">
                  <Form.Label>Kategorija:</Form.Label>
                  <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">Visos kategorijos</option>
                    <option value="Other">Other</option>
                    <option value="Phone">Phone</option>
                    <option value="PC">PC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              
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
                  <th>Kategorija</th>
                  <th>Kaina</th>
                  <th>Kiekis</th>
                  <th>Funkcijos</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
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
