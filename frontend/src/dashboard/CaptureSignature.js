import React, { useEffect, useState, useRef } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Card, Row, Col, Alert, Button } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";

import "./CaptureSignature.css";

export default function CaptureSignature() {
  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);
  const serviceId = window.location.pathname.split("/").pop();

  const { logout } = useAuth();

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

  const sigCanvas = useRef({});
  const [trimmedDataURL, setTrimmedDataURL] = useState(null);
  const [isSigned, setIsSigned] = useState(false);

  const saveSignature = async () => {
    const signatureData = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    setTrimmedDataURL(signatureData);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/signature/save-signature/${serviceId}`,
        { signature: signatureData },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      throw new Error(error);
    }
    setIsSigned(true);
  };

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/signature/get-signature/${serviceId}`,
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.signature) {
          setTrimmedDataURL(response.data.signature); // Set signature image
          setIsSigned(true); // Mark as signed
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    fetchSignature(); // Call the API to check signature
  }, [serviceId]);

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
            <Card.Title as="h6">Remonto {serviceId} registracija</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col>
                <Alert variant="info">
                  <p>
                    Užsakovas parašu žemiau patvirtina, kad sutinka su remonto
                    sąlygomis ir kad visa programinė įranga kietajame diske ar
                    kitose duomenų laikmenose priklauso jam. Todėl už
                    programinės įrangos legalumą atsako užsakovas.{" "}
                    <b>MB „IT112“</b> neatsako už jokių duomenų pateiktoje
                    įrangoje išsaugojimą, išskyrus nurodytus atvejus šiame akte.
                    Užsakovui patvirtinus įrangos remonto darbus ir vėliau
                    atsisakius tęsti remontą, turi kompensuoti sunaudoto laiko
                    bei detalių kaštus. Sutaisyta ar nesutaisyta įranga saugoma
                    ne ilgiau kaip vieną mėnesį. Neatsiėmus įrangos laiku,
                    įrenginio tolimesniam saugojimui taikomas 1 eur per dieną
                    mokestis. Tokiu atveju įrenginys grąžinamas klientui tik
                    sumokėjus saugojimo mokestį.
                  </p>
                </Alert>
              </Col>
            </Row>

            {/* Signature Section */}
            <Row className="justify-content-center">
              <Col md={8}>
                {isSigned ? (
                  <div>
                    <h6 className="text-success text-center mb-3">
                      Remontas <b>{serviceId}</b> sėkmingai pasirašytas.
                    </h6>
                    <div className="d-flex justify-content-center">
                      <img
                        src={trimmedDataURL}
                        alt="User's signature"
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                          width: "100%",
                          maxWidth: "500px",
                          height: "auto",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="">
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{
                        width: 700,
                        height: 300,
                        className:
                          "signatureCanvas mb-3 d-flex justify-content-center",
                      }}
                    />
                    <div className="d-flex justify-content-center">
                      <Button
                        variant="primary"
                        onClick={saveSignature}
                        className="me-2"
                      >
                        Pasirašyti
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => sigCanvas.current.clear()}
                      >
                        Išvalyti
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Footer />
      </div>
    </React.Fragment>
  );
}
