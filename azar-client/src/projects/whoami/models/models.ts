import {BaseModel} from "../../shared/models/models.ts";

export interface WhoAmIData extends BaseModel {
    headerTitle: string;
    headerIntro: string;
    mainContentQuestion: string;
    mainContentFirstTitle: string;
    mainContentFirstData: string[];
    mainContentSecondTitle: string;
    mainContentSecondData: string[];
    cvButton: string;
    photos: string[];
}

export interface EmailData extends BaseModel {
    title: string;
    body: string;
}