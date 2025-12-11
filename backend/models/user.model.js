import mongoose from "mongoose";

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		unique: true,
	},
	password: {
		type: String,
	},
	fullName: {
		type: String,
	},
	phoneNumber: {
		type: String,
	},
	image: {
		type: String,
		default: "",
	},
	searchHistory: {
		type: Array,
		default: [],
	},
	otp: {
		type: String,
	},
	otpExpires: {
		type: Date,
	},
	isFirstLogin: {
		type: Boolean,
		default: true,
	},
	preferredCategory: {
		type: [String],
		default: ["general"],
	},
	country: {
		type: String,
		default: "us",
	},
	following: {
		type: [String],
		default: [],
	},
});

export const User = mongoose.model("User", userSchema);
