import React, { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import img14 from "../assets/img/img14.jpg";
import img16 from "../assets/img/img16.jpg";
import axios from "axios";
import { useAuth } from "../AuthContext";

export default function Chat({ itemId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  // eslint-disable-next-line
  const { nickname } = useAuth();

  function handleComment() {
    const res = async () => {
      try {
        const values = {
          serviceId: itemId,
          comment: text,
          // eslint-disable-next-line
          createdBy: nickname,
          isPublic: false,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_URL}/dashboard/comment`,
          values,
          {
            withCredentials: true,
          }
        );
        // eslint-disable-next-line
        const newComment = commentsToMessages(response.data, nickname);
        setComments(newComment);
        setText("");
      } catch (error) {
        console.log(error);
      }
    };
    res();
  }

  function commentsToMessages(comments, currentUserId) {
    // Group comments by date
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

    // Convert to messageGroup format
    const messageGroup = Object.keys(groupedByDate).map((date) => {
      const items = groupedByDate[date].map((comment) => {
        const isCurrentUser = comment.createdBy === currentUserId;
        return {
          avatar: {
            status: "online", // You might want to fetch this dynamically
            img: isCurrentUser ? img16 : img14, // Adjust based on user
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
      return {
        date: date,
        items: items,
      };
    });

    return messageGroup;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/dashboard/comments/${itemId}`,
          {
            withCredentials: true,
          }
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

  // Toggle chat option in each item
  const navToggle = (e) => {
    e.target.closest(".row").classList.toggle("nav-show");
  };

  async function togglePublicStatus(commentId) {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_URL}/dashboard/comment/${commentId}/toggle-public`,
        "",
        {
          withCredentials: true,
        }
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

  return (
    <React.Fragment>
      <div className={"chat-panel"}>
        <div className="chat-body" style={{ margin: 0 }}>
          <div className="chat-body-header">
            <div className="chat-item">
              <div className="chat-item-body">
                <h6 className="mb-1">{itemId}</h6>
              </div>
            </div>
          </div>
          <PerfectScrollbar className="chat-body-content">
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
                              className={`msg-bubble ${
                                message.isPublic ? "bg-success" : ""
                              }`}
                              onMouseOver={navToggle}
                              onMouseLeave={navToggle}
                              onClick={() => togglePublicStatus(message.id)}
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
          <div className="chat-body-footer">
            <div className="msg-box">
              <Form.Control
                type="text"
                placeholder="Write your comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className="msg-send"
                type="submit"
                onClick={handleComment}
              >
                <i className="ri-send-plane-2-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </React.Fragment>
  );
}
