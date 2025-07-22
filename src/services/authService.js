import axios from "axios";
import { BASE_URL } from "../constants";

const API_URL = `${BASE_URL}/api/auth`;

export const signup = (username, password) => {
  return axios.post(`${API_URL}/signup`, { username, password });
};

export const login = (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
