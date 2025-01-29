import {OPS_PREFIX} from "../../shared/utils/constants.ts";

/* CV */
const CV_PREFIX = "/cv";
export const CV_GET_API = CV_PREFIX + "/get";
export const CV_SEND_TO_EMAIL_API = CV_PREFIX + "/sendToEmail";
export const CV_UPDATE_API = CV_PREFIX + OPS_PREFIX + "/update";

/* WhoAmI */
const WHO_AM_I_PREFIX = "/whoami";
export const WHO_AM_I_GET_API = WHO_AM_I_PREFIX + "/get";
export const WHO_AM_I_UPDATE_API = WHO_AM_I_PREFIX + OPS_PREFIX + '/update';

/* Email */
const EMAIL_PREFIX = "/email";
export const EMAIL_GET_API = EMAIL_PREFIX + OPS_PREFIX + "/get";
export const EMAIL_UPDATE_API = EMAIL_PREFIX + OPS_PREFIX + '/update';
