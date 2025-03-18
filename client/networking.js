import axios from "axios";

const instance = axios.create({
    baseURL: "http://127.0.0.1:5000", // change this to actual server URL in deployment stage
})

instance.interceptors.request.use((config) => {
    config.headers["content-type"] = "application/json";

    return config;
}, (err) => {
    return Promise.reject(err);
})

export default instance;