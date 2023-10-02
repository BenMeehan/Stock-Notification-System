import React, { Component } from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      errorMessage: "",
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = this.state;

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });

      const { token, userId } = response.data;

      this.props.onLogin(token, userId);
      this.props.history.push("/stocklist");
    } catch (error) {
      console.error("Login failed:", error.response);
      this.setState({
        errorMessage: "Login failed. Please check your credentials.",
      });
    }
  };

  render() {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={this.state.username}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={this.state.password}
              onChange={this.handleInputChange}
              required
            />
          </div>
          {this.state.errorMessage && (
            <div style={{ color: "red" }}>{this.state.errorMessage}</div>
          )}
          <div>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(Login);
