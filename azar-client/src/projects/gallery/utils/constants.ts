import {OPS_PREFIX} from "../../shared/utils/constants.ts";

const ROUTE_PREFIX = "/g";

/* Photos */
const PHOTOS_PREFIX = ROUTE_PREFIX + "/photo";
export const PHOTOS_UPLOAD_PHOTO_API = PHOTOS_PREFIX + OPS_PREFIX + "/upload";
export const PHOTOS_GET_LIGHTWEIGHT_PHOTO_API = PHOTOS_PREFIX + "/getLightweight/";
export const PHOTOS_GET_PHOTO_WITH_THUMBNAIL_API = PHOTOS_PREFIX + "/getWithThumbnail/";
export const PHOTOS_GET_PHOTO_WITH_PHOTO_API = PHOTOS_PREFIX + "/getWithPhoto/";
export const PHOTOS_GET_PHOTOS_ID_API = PHOTOS_PREFIX + "/getIds";
export const PHOTOS_DELETE_PHOTO_API = PHOTOS_PREFIX + OPS_PREFIX + "/delete/";
export const PHOTOS_REFRESH_PHOTO_METADATA_API = PHOTOS_PREFIX + OPS_PREFIX + "/refreshMetadata/";
export const PHOTOS_UPDATE_PHOTO_API = PHOTOS_PREFIX + OPS_PREFIX + "/update/";