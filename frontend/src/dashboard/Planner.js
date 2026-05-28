import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Card, Form, Offcanvas, Badge, Button, Row, Col } from "react-bootstrap";
import { Toaster, toast } from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";

import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { statusConfig, PLANNABLE_STATUSES } from "../data/statusConfig";

const API = import.meta.env.VITE_APP_URL;

function toIsoDay(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function formatLabel(svc) {
  const dev = svc.deviceModel ? ` · ${svc.deviceModel}` : "";
  return `#${svc.id}${dev}`;
}

function SidebarCard({ svc }) {
  const cfg = statusConfig[svc.status] || { hex: "#6c757d", label: svc.status };
  return (
    <div
      className="fc-event planner-sidebar-card"
      data-service-id={svc.id}
      style={{
        borderLeft: `4px solid ${cfg.hex}`,
        background: "#fff",
        padding: "6px 8px",
        marginBottom: "6px",
        borderRadius: "4px",
        boxShadow: "0 1px 2px rgba(0,0,0,.08)",
        cursor: "grab",
        fontSize: "12px",
      }}
    >
      <div style={{ fontWeight: 600 }}>{formatLabel(svc)}</div>
      {svc.name || svc.number ? (
        <div style={{ color: "#555" }}>
          {svc.name} {svc.number ? `· ${svc.number}` : ""}
        </div>
      ) : null}
      {svc.failure ? (
        <div
          style={{
            color: "#777",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {svc.failure}
        </div>
      ) : null}
    </div>
  );
}

export default function Planner() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSvc, setActiveSvc] = useState(null);
  const [visibleRange, setVisibleRange] = useState(null);

  const sidebarRef = useRef(null);
  const draggableRef = useRef(null);
  const calendarRef = useRef(null);

  const fetchServices = async (from, to) => {
    try {
      const params = {};
      if (from && to) {
        params.from = from.toISOString();
        params.to = to.toISOString();
      }
      const res = await axios.get(`${API}/api/dashboard/planner/services`, {
        params,
        withCredentials: true,
      });
      setServices(res.data.services || []);
    } catch (err) {
      console.error(err);
      toast.error("Nepavyko užkrauti paslaugų");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Initialize external draggable for sidebar
  useEffect(() => {
    if (!sidebarRef.current) return;
    if (draggableRef.current) {
      draggableRef.current.destroy();
    }
    draggableRef.current = new Draggable(sidebarRef.current, {
      itemSelector: ".planner-sidebar-card",
      eventData: (el) => {
        const id = el.getAttribute("data-service-id");
        const svc = services.find((s) => s.id === id);
        if (!svc) return {};
        const cfg = statusConfig[svc.status] || { hex: "#6c757d" };
        return {
          id: svc.id,
          title: formatLabel(svc),
          backgroundColor: cfg.hex,
          borderColor: cfg.hex,
          extendedProps: { svc },
        };
      },
    });
    return () => {
      if (draggableRef.current) draggableRef.current.destroy();
    };
  }, [services]);

  const planned = useMemo(
    () => services.filter((s) => s.plannedDate),
    [services]
  );
  const unplanned = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services
      .filter((s) => !s.plannedDate)
      .filter((s) => {
        if (!q) return true;
        return (
          (s.id || "").toLowerCase().includes(q) ||
          (s.deviceModel || "").toLowerCase().includes(q) ||
          (s.name || "").toLowerCase().includes(q) ||
          (s.number || "").toLowerCase().includes(q) ||
          (s.failure || "").toLowerCase().includes(q)
        );
      });
  }, [services, search]);

  const events = useMemo(
    () =>
      planned.map((svc) => {
        const cfg = statusConfig[svc.status] || { hex: "#6c757d" };
        return {
          id: svc.id,
          title: formatLabel(svc),
          start: svc.plannedDate,
          allDay: true,
          backgroundColor: cfg.hex,
          borderColor: cfg.hex,
          extendedProps: { svc },
        };
      }),
    [planned]
  );

  const patchPlan = async (id, plannedDate) => {
    try {
      await axios.patch(
        `${API}/api/dashboard/planner/services/${id}/plan`,
        { plannedDate },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
      toast.error("Nepavyko išsaugoti datos");
      throw err;
    }
  };

  const handleEventDrop = async (info) => {
    const id = info.event.id;
    const newDate = toIsoDay(info.event.start);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, plannedDate: newDate } : s))
    );
    try {
      await patchPlan(id, newDate);
    } catch {
      info.revert();
      fetchServices(visibleRange?.start, visibleRange?.end);
    }
  };

  const handleExternalDrop = async (info) => {
    const id = info.draggedEl.getAttribute("data-service-id");
    if (!id) return;
    const newDate = toIsoDay(info.date);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, plannedDate: newDate } : s))
    );
    try {
      await patchPlan(id, newDate);
    } catch {
      fetchServices(visibleRange?.start, visibleRange?.end);
    }
  };

  const handleEventClick = (info) => {
    const svc = info.event.extendedProps.svc;
    if (svc) setActiveSvc(svc);
  };

  const unschedule = async (svc) => {
    setServices((prev) =>
      prev.map((s) => (s.id === svc.id ? { ...s, plannedDate: null } : s))
    );
    setActiveSvc(null);
    try {
      await patchPlan(svc.id, null);
      toast.success("Atplanuota");
    } catch {
      fetchServices(visibleRange?.start, visibleRange?.end);
    }
  };

  const handleDatesSet = (arg) => {
    setVisibleRange({ start: arg.start, end: arg.end });
    fetchServices(arg.start, arg.end);
  };

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <Toaster position="top-right" />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="main-title mb-0">Planuotojas</h4>
            <small className="text-muted">
              Pertempkite paslaugas iš šono į kalendorių
            </small>
          </div>
        </div>

        <Row className="g-3">
          <Col xs={12} md={4} lg={3}>
            <Card>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <strong>Neplanuotos</strong>
                <Badge bg="secondary">{unplanned.length}</Badge>
              </Card.Header>
              <Card.Body style={{ padding: "10px" }}>
                <Form.Control
                  size="sm"
                  placeholder="Ieškoti ID, modelio, kliento…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-2"
                />
                <div
                  ref={sidebarRef}
                  style={{
                    maxHeight: "calc(100vh - 260px)",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {unplanned.length === 0 ? (
                    <div className="text-muted small text-center py-3">
                      Nėra neplanuotų paslaugų
                    </div>
                  ) : (
                    unplanned.map((svc) => (
                      <SidebarCard key={svc.id} svc={svc} />
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={8} lg={9}>
            <Card>
              <Card.Body>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  firstDay={1}
                  locale="lt"
                  buttonText={{ today: "Šiandien" }}
                  height="calc(100vh - 220px)"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "",
                  }}
                  editable
                  droppable
                  events={events}
                  eventDrop={handleEventDrop}
                  drop={handleExternalDrop}
                  eventClick={handleEventClick}
                  datesSet={handleDatesSet}
                  dayMaxEvents={4}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Offcanvas
          show={!!activeSvc}
          onHide={() => setActiveSvc(null)}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              {activeSvc ? `Paslauga #${activeSvc.id}` : ""}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {activeSvc && (
              <>
                <div className="mb-2">
                  <Badge bg={statusConfig[activeSvc.status]?.bg || "secondary"}>
                    {activeSvc.status}
                  </Badge>
                </div>
                <dl className="row mb-3">
                  <dt className="col-5">Įrenginys</dt>
                  <dd className="col-7">{activeSvc.deviceModel || "—"}</dd>
                  <dt className="col-5">Klientas</dt>
                  <dd className="col-7">{activeSvc.name || "—"}</dd>
                  <dt className="col-5">Telefonas</dt>
                  <dd className="col-7">{activeSvc.number || "—"}</dd>
                  <dt className="col-5">Gedimas</dt>
                  <dd className="col-7">{activeSvc.failure || "—"}</dd>
                  <dt className="col-5">Suplanuota</dt>
                  <dd className="col-7">
                    {activeSvc.plannedDate
                      ? new Date(activeSvc.plannedDate).toLocaleDateString("lt-LT")
                      : "—"}
                  </dd>
                </dl>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-danger"
                    onClick={() => unschedule(activeSvc)}
                  >
                    Atplanuoti
                  </Button>
                </div>
              </>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </div>
      <Footer />
    </React.Fragment>
  );
}
