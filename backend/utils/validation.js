const mongoose = require("mongoose");

const isValid = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const isValidRequestBody = (data) => {
  return data && Object.keys(data).length > 0;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isBooleanLike = (val) => {
  if (typeof val === "boolean") return true;
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    return v === "true" || v === "false";
  }
  return false;
};

const toBoolean = (val) => {
  if (typeof val === "boolean") return val;
  return String(val).trim().toLowerCase() === "true";
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

module.exports = {
  isValid,
  isValidRequestBody,
  isValidObjectId,
  isBooleanLike,
  toBoolean,
  isValidEmail
};
