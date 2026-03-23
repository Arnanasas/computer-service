import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Form } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import img14 from "../assets/img/img14.jpg";
import img16 from "../assets/img/img16.jpg";
import axios from "axios";
import { useAuth } from "../AuthContext";

export default function Chat({ itemId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { nickname } = useAuth();
  const inputRef = useRef(null);

  async function handleComment() {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      const values = {
        serviceId: itemId,
        comment: text.trim(),
        createdBy: nickname,
        isPublic: false,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/dashboard/comment`,
        values,
        { withCredentials: true }
      );
      const newComment = commentsToMessages(response.data, nickname);
      setComments(newComment);
      setText("");
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  }

  function commentsToMessages(comments, currentUserId) {
    const groupedByDate = comments.reduce((acc, comment) => {
      const date = new Date(comment.createdAt).toLocaleDateString("lt-LT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(comment);
      return acc;
    }, {});

    const messageGroup = Object.keys(groupedByDate).map((date) => {
      const items = groupedByDate[date].map((comment) => {
        const isCurrentUser = comment.createdBy === currentUserId;
        return {
          avatar: {
            status: "online",
            img: isCurrentUser ? img16 : img14,
          },
          reverse: isCurrentUser,
          messages: [
            {
              id: comment._id,
              text: comment.comment,
              time: new Date(comment.createdAt).toLocaleTimeString("lt-LT"),
              isPublic: comment.isPublic,
            },
          ],
        };
      });
      return { date, items };
    });

    return messageGroup;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_URL}/api/dashboard/comments/${itemId}`,
          { withCredentials: true }
        );
        const processedComments = commentsToMessages(response.data, nickname);
        setComments(processedComments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    document.body.classList.add("page-app");
    return () => {
      document.body.classList.remove("page-app");
    };
  }, [itemId]);

  const navToggle = (e) => {
    e.target.closest(".row").classList.toggle("nav-show");
  };

  async function togglePublicStatus(commentId) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_URL}/api/dashboard/comment/${commentId}/toggle-public`,
        "",
        { withCredentials: true }
      );
      if (response.data.success) {
        setComments((prevComments) => {
          return prevComments.map((dateGroup) => {
            dateGroup.items = dateGroup.items.map((item) => {
              item.messages = item.messages.map((message) => {
                if (message.id === commentId) {
                  message.isPublic = response.data.isPublic;
                }
                return message;
              });
              return item;
            });
            return dateGroup;
          });
        });
      }
    } catch (error) {
      console.error("Error toggling public status:", error);
    }
  }

  const hasComments = comments.some((g) => g.items.length > 0);

  return (
    <div className="chat-panel d-flex flex-column" style={{ height: "calc(100vh - 120px)" }}>
      <div className="chat-body d-flex flex-column flex-grow-1" style={{ margin: 0, minHeight: 0 }}>
        <PerfectScrollbar className="chat-body-content flex-grow-1" style={{ minHeight: 0 }}>
          {!hasComments && (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted py-5">
              <i className="ri-chat-3-line" style={{ fontSize: "2.5rem", opacity: 0.3 }}></i>
              <span className="mt-2">Komentarų nėra</span>
            </div>
          )}
          {comments.map((msgroup, index) => (
            <React.Fragment key={index}>
              <div className="divider">
                <span>{msgroup.date}</span>
              </div>
              {msgroup.items.map((item, ind) => (
                <div
                  key={ind}
                  className={"msg-item" + (item.reverse ? " reverse" : "")}
                >
                  <div className="msg-body">
                    {item.messages.map((message, i) => (
                      <Row key={i} className="gx-3 row-cols-auto">
                        <Col>
                          <div
                            className={`msg-bubble ${message.isPublic ? "bg-success text-white" : ""}`}
                            style={{ cursor: "pointer" }}
                            onMouseOver={navToggle}
                            onMouseLeave={navToggle}
                            onClick={() => togglePublicStatus(message.id)}
                            title={message.isPublic ? "Viešas komentaras (spustelėkite, kad paslėptumėte)" : "Privatus komentaras (spustelėkite, kad paskelbtumėte)"}
                          >
                            {message.text}
                            <span>{message.time}</span>
                          </div>
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </PerfectScrollbar>
        <div className="chat-body-footer flex-shrink-0" style={{ borderTop: "1px solid var(--bs-border-color)", padding: "12px" }}>
          <div className="d-flex align-items-center gap-2 w-100">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder="Rašykite komentarą..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              autoFocus
              style={{ width: "100%" }}
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={isSending || !text.trim()}
              title="Siųsti (Enter)"
              className="btn btn-primary d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, borderRadius: "50%", padding: 0, flexShrink: 0 }}
            >
              <i className={isSending ? "ri-loader-4-line" : "ri-send-plane-2-line"} style={{ fontSize: "1.1rem" }}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
