import { path } from "../../utils/path";
import useFetch from "../hooks/useFetch";
import { atom } from "jotai";

const gets = () => {

    const { data, loading, err } = useFetch(`${path}/get-active-seesion`);

    return activeSession = atom(data);
};
