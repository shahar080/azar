import {useContext} from "react";
import {LoadingContext} from "./LoadingProvider.tsx";

export const useLoading = () => useContext(LoadingContext);
