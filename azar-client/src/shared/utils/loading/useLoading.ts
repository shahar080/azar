import {useContext} from "react";
import {LoadingContext} from "./LoadingProvider";

export const useLoading = () => useContext(LoadingContext);
