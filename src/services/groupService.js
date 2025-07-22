import axios from "axios";
import { BASE_URL } from "../constants";

const API_URL = `${BASE_URL}/api/groups`;

export const createGroup = (name, members, admin) => {
  return axios.post(API_URL, { name, members, admin });
};

export const getGroupsForUser = (username) => {
  return axios.get(`${API_URL}/user/${username}`);
};
