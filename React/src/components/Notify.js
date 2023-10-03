import React, { useEffect } from "react";

function Notify() {
  useEffect(() => {
    subscribeToPushNotifications();
  }, []);

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BIxUdWmmMbmf8EVdQGFO4ZCg31Gm0EUb_LLlf_CEeE16kh6VFQPk9tIJEGNUiLazUb5NjYOQNhnKtM-cpgv7_G0",
      });
      const clientId = localStorage.getItem("userId");
      sendSubscriptionToServer(newSubscription, clientId);
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  };

  const sendSubscriptionToServer = (subscription, clientId) => {
    // Send a POST request to your Node.js server to save the subscription along with the client ID
    fetch("https://subservice.onrender.com/sub/client", {
      method: "POST",
      body: JSON.stringify({ subscription, clientId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return <></>;
}

export default Notify;
