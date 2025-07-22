import axios from "axios";

const API_URL = "http://localhost:5001/api/auth";

export const signup = (username, password) => {
  return axios.post(`${API_URL}/signup`, { username, password });
};

export const login = (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
