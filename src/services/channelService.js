import axios from "axios";

const API_URL = "http://localhost:5001/api/channels";

export const getPublicChannels = () => {
  return axios.get(API_URL);
};

export const createChannel = (name, description, createdBy) => {
  return axios.post(API_URL, { name, description, createdBy });
};

export const joinChannel = (channelId, username) => {
  return axios.post(`${API_URL}/join`, { channelId, username });
};

export const leaveChannel = (channelId, username) => {
  return axios.post(`${API_URL}/leave`, { channelId, username });
};
