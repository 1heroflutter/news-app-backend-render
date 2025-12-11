import axios from "axios";
import { ENV_VARS } from "../config/envVars.js";

export const fetchFromNews = async (url) => {
  const apiKey = ENV_VARS.NEWS_API_KEY;

  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${separator}api_key=${apiKey}`;

  const response = await axios.get(finalUrl);

  if (response.status !== 200) {
    throw new Error("Failed to fetch data from News API: " + response.statusText);
  }

  return response.data;
};
