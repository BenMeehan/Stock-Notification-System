import React, { useState, useEffect } from "react";
import axios from "axios";

const Stock = ({ symbol, price, token }) => {
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [priceDirection, setPriceDirection] = useState("higher"); // Default to "higher"
  const [subscriptions, setSubscriptions] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Fetch the list of subscriptions when the component mounts
    axios
      .get("https://subservice.onrender.com/sub/subscriptions", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((response) => {
        setSubscriptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching subscriptions:", error);
      });
  }, [token]);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubscriptionModalClose = () => {
    setShowSubscriptionModal(false);
  };

  const handleRadioChange = (event) => {
    setPriceDirection(event.target.value);
  };

  const handleInputChange = (event) => {
    setTargetPrice(event.target.value);
  };

  const handleSubmit = () => {
    const requestData = {
      symbol,
      targetPrice,
      priceDirection,
    };

    const config = {
      headers: {
        Authorization: `${token}`,
      },
    };

    axios
      .post(
        "https://subservice.onrender.com/sub/subscriptions",
        requestData,
        config
      )
      .then((response) => {
        console.log("Subscription created:", response.data);
        window.alert("Subscription created");
      })
      .catch((error) => {
        console.error("Error creating subscription:", error);
        window.alert("Error creating subscription");
      });

    setShowModal(false);
  };

  const handleUnsubscribe = (subscriptionId) => {
    axios
      .delete(
        `https://subservice.onrender.com/sub/unsubscribe/${subscriptionId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      .then(() => {
        // Remove the subscription from the list
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.filter((sub) => sub.id !== subscriptionId)
        );
        window.alert("Subscription unsubscribed");
      })
      .catch((error) => {
        console.error("Error unsubscribing:", error);
        window.alert("Error unsubscribing");
      });
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">{symbol}</h2>
        <p className="card-text">Price: {price}</p>
        <button className="btn btn-primary" onClick={handleButtonClick}>
          Set Alert
        </button>
        <button
          className="btn btn-secondary ml-2"
          onClick={() => setShowSubscriptionModal(true)}
        >
          View Subscriptions
        </button>
        <div
          className={`modal ${showModal ? "show" : ""}`}
          style={{ display: showModal ? "block" : "none" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Alert Price for {symbol}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Price Direction</label>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="priceDirection"
                        value="higher"
                        checked={priceDirection === "higher"}
                        onChange={handleRadioChange}
                      />
                      <label className="form-check-label">Higher than</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="priceDirection"
                        value="lower"
                        checked={priceDirection === "lower"}
                        onChange={handleRadioChange}
                      />
                      <label className="form-check-label">Lower than</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="priceDirection"
                        value="equal"
                        checked={priceDirection === "equal"}
                        onChange={handleRadioChange}
                      />
                      <label className="form-check-label">Equal to</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Price</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter target price"
                      value={targetPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`modal ${showSubscriptionModal ? "show" : ""}`}
          style={{ display: showSubscriptionModal ? "block" : "none" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Subscriptions for {symbol}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleSubscriptionModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <ul>
                  {subscriptions.map((subscription) => (
                    <li key={subscription.id}>
                      {console.log(subscription)}
                      Price: {subscription.target}, Direction:{" "}
                      {subscription.direction}
                      <button
                        className="btn btn-danger btn-sm ml-2"
                        onClick={() => handleUnsubscribe(subscription.id)}
                      >
                        Unsubscribe
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSubscriptionModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;
