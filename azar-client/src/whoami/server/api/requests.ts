export type BaseRequest = object

export interface EmailCVRequest extends BaseRequest {
    email: string;
}