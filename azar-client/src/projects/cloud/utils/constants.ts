import {ADMIN_PREFIX} from "../../shared/utils/constants.ts";

const ROUTE_PREFIX = "/c";

/* TOKEN */
export const TOKEN_REFRESH_API = "/token/refresh";
/* PDF */
const PDF_PREFIX = ROUTE_PREFIX + ADMIN_PREFIX + "/pdf"
export const PDF_UPLOAD_API = PDF_PREFIX + "/upload";
export const PDF_DELETE_API = PDF_PREFIX + "/delete/";
export const PDF_UPDATE_API = PDF_PREFIX + "/update";
export const PDF_THUMBNAIL_API = PDF_PREFIX + "/thumbnail/";
export const PDF_GET_API = PDF_PREFIX + "/get/";
export const PDF_GET_ALL_API = PDF_PREFIX + "/getAll";
/* PREFERENCE */
const PREFERENCE_PREFIX = ROUTE_PREFIX + ADMIN_PREFIX + "/preference"
export const PREFERENCE_UPDATE_API = PREFERENCE_PREFIX + "/update";
export const PREFERENCE_GET_ALL_API = PREFERENCE_PREFIX + "/getAll";
/* USER */
const USER_PREFIX = ROUTE_PREFIX + "/user"
export const USER_LOGIN_API = USER_PREFIX + "/login";
export const USER_ADD_API = USER_PREFIX + ADMIN_PREFIX + "/add";
export const USER_GET_ALL_API = USER_PREFIX + ADMIN_PREFIX + "/getAll";
export const USER_DELETE_API = USER_PREFIX + ADMIN_PREFIX + "/delete/";
export const USER_UPDATE_API = USER_PREFIX + ADMIN_PREFIX + "/update";

/* Preferences */
export const DRAWER_PIN_STR = "DRAWER_PINNED";
export const DARK_MODE_STR = "DARK_MODE";