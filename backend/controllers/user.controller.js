import { User } from "../models/user.model.js";
export async function isFirstTimeUser(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, isFirstTimeUser: user.isFirstLogin });
}
export async function setupUserProfile(req, res) {
	const {username,fullName,phoneNumber,image, preferredCategory, country, } = req.body;
	if (!preferredCategory || !country) {
		return res.status(400).json({ success: false, message: "All fields are required" });
	}

	try {
		await User.findByIdAndUpdate(req.user._id, {
			username,
			fullName,
			phoneNumber,
			image : image || req.user.image,
			preferredCategory,
			country
		});
    var user = await User.findById(req.user._id);
    user.isFirstLogin = false;
    await user.save();
		res.status(200).json({ success: true, message: { user: req.user } });
	} catch (error) {
		console.log("Error in setupProfile controller: ", error.message);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}
export async function updateUserProfile(req, res) {
	const allowedFields = ["username", "fullName", "phoneNumber", "image", "preferredCategory", "country", "following"];
	const updates = {};

	allowedFields.forEach(field => {
		if (req.body[field] !== undefined) {
			updates[field] = req.body[field];
		}
	});

	if (Object.keys(updates).length === 0) {
		return res.status(400).json({ success: false, message: "No valid fields provided for update" });
	}

	try {
		await User.findByIdAndUpdate(req.user._id, updates);
		res.status(200).json({ success: true, message: "User profile updated successfully" });
	} catch (error) {
		console.log("Error in updateUserProfile controller: ", error.message);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}

