import bcrypt from "bcrypt";
import User from "../Schema/User.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import "dotenv/config";

//* * * * * * GOOGLE Auth * * * * * * \\
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

// Regex validations
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// Unique username generator
const generateUsername = async (email) => {
  let username = email.split("@")[0];

  let isUsernameUnique = await User.exists({
    "personal_info.username": username
  });
  if (isUsernameUnique) {
    username += nanoid(3);
  }

  return username;
};

const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d"
  }); //* create access token
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    fullname: user.personal_info.fullname,
    username: user.personal_info.username
  };
};

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input fields
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique username
    const username = await generateUsername(email);

    // Create user
    const newUser = new User({
      personal_info: {
        fullname: fullname,
        password: hashedPassword,
        email,
        username
      }
    });

    await newUser.save();

    res.status(201).json(formatDataToSend(newUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error, Unable to process request"
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
      });
    }
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.google_auth) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
      res.json(formatDataToSend(user));
    } else {
      return res.status(403).json({
        success: false,
        message: "User already registered with Google"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error, Unable to process request"
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    let { access_token } = req.body;
    const decodedUser = await getAuth().verifyIdToken(access_token);
    let { email, name, picture } = decodedUser;

    picture = picture.replace("s96-c", "s384-c");

    let user;
    try {
      user = await User.findOne({ "personal_info.email": email }).select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
      );
    } catch (err) {
      return res.status(500).json({
        note: "Error in server google_auth controller: " + err.message,
        message: "Server Error, Unable to process request"
      });
    }

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          note: "User already registered with a different method",
          message: "User already registered with a different method"
        });
      }
      return res.status(200).json(formatDataToSend(user));
    }

    // If user does not exist, create a new one
    let username = await generateUsername(email);
    user = new User({
      personal_info: {
        fullname: name,
        email,
        username,
        profile_img: picture
      },
      google_auth: true
    });

    try {
      await user.save();
    } catch (err) {
      return res.status(500).json({
        note: "Error in saving user: " + err.message,
        message: "Server Error, Unable to process request"
      });
    }

    return res.status(200).json(formatDataToSend(user));
  } catch (err) {
    return res.status(401).json({
      note: "Invalid Google access token",
      message: "Unauthorized access"
    });
  }
};
