import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { ENV_VARS } from "../config/envVars.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import {OAuth2Client} from 'google-auth-library';
const client = new OAuth2Client(ENV_VARS.GOOGLE_CLIENT_ID);
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
export async function signup(req, res) {
	try {

		const { email, password } = req.body;
	
		if (!email || !password) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			return res.status(400).json({ success: false, message: "Invalid email" });
		}

		if (password.length < 6) {
			return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
		}

		const existingUserByEmail = await User.findOne({ email: email });

		if (existingUserByEmail) {
			return res.status(400).json({ success: false, message: "Email already exists" });
		}

		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];

		const image = PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

		const newUser = new User({
			email,
			password: hashedPassword,
			image,
		});

		const token = await generateTokenAndSetCookie(newUser._id, res);
		await newUser.save();

		res.status(201).json({
			success: true,
			user: {
				...newUser._doc,
				token:token
			},
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
export async function login(req, res) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({ success: false, message: "Invalid credentials" });
		}

		const isPasswordCorrect = await bcryptjs.compare(password, user.password);

		if (!isPasswordCorrect) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		const token = generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			success: true,
			user: {
				...user._doc,
				token: token
			},
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
export async function loginWithGoogle(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' });
    }

    // Verify ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: ENV_VARS.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();

    // payload chứa thông tin người dùng từ Google
    const { sub: googleId, email, name, picture } = payload;

    // Tìm hoặc tạo user trong MongoDB
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: picture,
      });
    }

    // Cấp JWT token để client lưu (nếu cần)
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login with Google successful',
      user,
      accessToken,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: 'Login with Google failed' });
  }
}
export async function sendOtp(req, res) {
  const { email } = req.body;
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Cấu hình SendGrid ĐÚNG CÁCH
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: ENV_VARS.SENDGRID_API_KEY,
      }
    });

    await transporter.sendMail({
      from: 'vonhat10a4nh1@gmail.com', // Email đã verify trong SendGrid
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("SendGrid Error:", error);
    res.status(500).json({ 
      message: "Failed to send OTP",
      error: error.response?.body || error.message 
    });
  }
}
export async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
}
export async function resetPassword(req, res) {
	try {
		const { email, newPassword } = req.body;
		if (!email || !newPassword ) {
			return res.status(400).json({ success: false, message: "Email, new password are required" });
		}

		const user = await User.findOne({ email });

		// Update password
		user.password = await bcryptjs.hash(newPassword, 10);
		user.otp = undefined; // Clear OTP
		user.otpExpires = undefined; // Clear OTP expiration
		await user.save();

		res.status(200).json({ success: true, message: "Password reset successfully" });
	} catch (error) {
		console.log("Error in resetPassword controller", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
export async function logout(req, res) {
	try {
		res.clearCookie("jwt-news");
		res.status(200).json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}

export async function authCheck(req, res) {
	try {
		console.log("req.user:", req.user);
		res.status(200).json({ success: true, user: req.user });
	} catch (error) {
		console.log("Error in authCheck controller", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
const generateToken = (userId, res) => {
    const accessToken = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
        expiresIn: "15m", 
    });

    const refreshToken = jwt.sign({ userId }, ENV_VARS.JWT_REFRESH_SECRET, {
        expiresIn: "7d", 
    });

    return { accessToken, refreshToken };
};


export const refreshTokens = async (req, res) => {
    const { refreshToken: clientRefreshToken } = req.body; 

    if (!clientRefreshToken) {
        return res.status(401).json({ success: false, message: "Unauthorized - Refresh Token Required" });
    }

    try {
        const decoded = jwt.verify(clientRefreshToken, ENV_VARS.JWT_REFRESH_SECRET);
        
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid Refresh Token" });
        }

        const { accessToken, refreshToken } = generateToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            accessToken,
            refreshToken,
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
             return res.status(401).json({ success: false, message: "Unauthorized - Refresh Token Expired" });
        }
        console.error("Token refresh error: ", error.message);
        res.status(401).json({ success: false, message: "Unauthorized - Invalid Refresh Token" });
    }
};