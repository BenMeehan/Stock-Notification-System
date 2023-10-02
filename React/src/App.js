import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import StockList from "./components/StockList";
import Login from "./components/Login";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (jwtToken, userId) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("userId", userId);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route
            path="/login"
            render={(props) => <Login {...props} onLogin={handleLogin} />}
          />
          <ProtectedRoute
            path="/stocklist"
            component={StockList}
            isAuthenticated={!!token}
            token={token}
          />
          <Redirect from="/" to="/login" />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
