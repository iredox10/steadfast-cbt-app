import { useState, useEffect } from "react";
import axios from "axios";
import { path } from "../../utils/path";

const useFetch = (uri) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                // Get token from localStorage for authentication
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const res = await axios.get(`${path}${uri}`, { headers });
                setData(res.data);
            } catch (error) {
                console.error("Fetch error:", error);
                // Extract error message properly
                let errorMessage = "An error occurred";
                
                if (error.response?.data) {
                    // Handle different response data types
                    const responseData = error.response.data;
                    if (typeof responseData === 'string') {
                        errorMessage = responseData;
                    } else if (responseData && typeof responseData === 'object') {
                        if (responseData.error) {
                            errorMessage = responseData.error;
                        } else if (responseData.message) {
                            errorMessage = responseData.message;
                        } else {
                            // Fallback for any other object structure
                            errorMessage = JSON.stringify(responseData);
                        }
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                } else {
                    // Ensure we never set an object as the error
                    errorMessage = "Unknown error occurred";
                }
                
                // Make absolutely sure we're setting a string
                setErr(typeof errorMessage === 'string' ? errorMessage : "Error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [uri]);

    return { data, loading, err };
};

export default useFetch;
