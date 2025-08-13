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
                const res = await axios.get(`${path}${uri}`);
                setData(res.data);
            } catch (error) {
                console.error("Fetch error:", error);
                setErr(error.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [uri]);

    return { data, loading, err };
};

export default useFetch;
