import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { email, password };

    try {
      const response = await axios.post(
        "http://localhost:4050/api/users/login",
        data,
        {
          withCredentials: true,
        }
      );
      console.log("Login successful:", response.data);
      login(response.data);
      navigate("/services/all");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">
            computer-service
          </Link>
          <Card.Title>Login</Card.Title>
          <Card.Text>Welcome back! Please signin to continue.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Form.Label className="d-flex justify-content-between">
                Password <Link to="">Forgot password?</Link>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="btn-sign">
              Sign In
            </Button>

            {/* <div className="divider"><span>or sign in with</span></div>

            <Row className="gx-2">
              <Col><Button variant="" className="btn-facebook"><i className="ri-facebook-fill"></i> Facebook</Button></Col>
              <Col><Button variant="" className="btn-google"><i className="ri-google-fill"></i> Google</Button></Col>
            </Row> */}
          </Form>
        </Card.Body>
        <Card.Footer>
          Something wrong? <a href="mailto:admin@admin.com">admin@admin.com</a>
        </Card.Footer>
      </Card>
    </div>
  );
}
