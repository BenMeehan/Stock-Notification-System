import React, { useEffect, useState } from "react";
import Stock from "./Stocks";
import Notify from "./Notify";

const StockList = (props) => {
  const [socket, setSocket] = useState(null);
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080", ["Bearer", props.token]);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStockData((prevData) => ({ ...prevData, [data.symbol]: data.price }));
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setSocket(null);
    };
  }, []);

  return (
    <div>
      <Notify token={props.token} />
      <h1>Stock Prices</h1>
      <ul>
        {Object.entries(stockData).map(([symbol, price]) => (
          <Stock
            symbol={symbol}
            price={price}
            key={symbol}
            token={props.token}
          />
        ))}
      </ul>
    </div>
  );
};

export default StockList;
