import { useState, useEffect } from "react";
import axios from "axios";
import { path } from "../../utils/path";

const useFetch = (uri) => {
    const [data, setData] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await axios(`${path}${uri}`);
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetch();
    }, []);

    return { data, loading, err };
};

export default useFetch;
