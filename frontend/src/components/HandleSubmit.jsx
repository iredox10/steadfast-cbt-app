import axios from "axios";
import { useState } from "react";

const HandleSubmit = async (url, data) => {
    let response,err
    try {
        const res = await axios.post(url, { ...data });
        response = res.data
    } catch (error) {
        console.log(error);
        err = error
    }
    return {response,err}
};

export default HandleSubmit
