const IS_DEV = false;

/* Routes */
export const LANDING_ROUTE = "/";
export const LOGIN_ROUTE = "/login";
export const MANAGE_USERS_ROUTE = "/manage-users";
export const MANAGE_PREFERENCES_ROUTE = "/manage-preferences";

/* API */
export const BASE_URL_API = IS_DEV ? "http://127.0.0.1:8080/api" : 'https://shahar-azar.com/api';
// TOKEN
export const TOKEN_REFRESH_API = "/token/refresh";
// PDF
export const PDF_UPLOAD_API = "/pdf/upload";
export const PDF_DELETE_API = "/pdf/delete/";
export const PDF_UPDATE_API = "/pdf/update";
export const PDF_THUMBNAIL_API = "/pdf/thumbnail/";
export const PDF_GET_API = "/pdf/get/";
// PREFERENCE
export const PREFERENCE_ADD_API = "/preference/add";
export const PREFERENCE_DELETE_API = "/preference/delete/";
export const PREFERENCE_UPDATE_API = "/preference/update";
// USER
export const USER_LOGIN_API = "/user/login";
export const USER_ADD_API = "/user/ops/add";
export const USER_DELETE_API = "/user/ops/delete/";
export const USER_UPDATE_API = "/user/ops/update";

/* General */
export const TRUE_STR = "true";
export const FALSE_STR = "false";

/* Preferences */
export const DRAWER_PIN_STR = "DRAWER_PINNED";