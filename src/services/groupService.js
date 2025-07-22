import axios from "axios";

const API_URL = "http://localhost:5001/api/groups";

export const createGroup = (name, members, admin) => {
  return axios.post(API_URL, { name, members, admin });
};

export const getGroupsForUser = (username) => {
  return axios.get(`${API_URL}/user/${username}`);
};
