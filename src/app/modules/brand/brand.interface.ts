import { Model, Types } from "mongoose";

export type IBrandStatus = "active" | "inactive" | "coming-soon" | "under-review" | "discontinue"

export type IBrand = {
  _id?: Types.ObjectId;
  code: string;
  name: string;
  title: string;
  description: string;
  coverPhoto: string;
  status: IBrandStatus;
}

export type BrandModel = Model<IBrand, Record<string, unknown>>;
export type IBrandFilters = { search?: string; name?: string };