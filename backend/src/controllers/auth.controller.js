import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { upserStreamUser } from "../lib/meet.js";


export async function signup(req, res) {
    const { email, password, fullname } = req.body;
    try{
if(!email || !password || !fullname){
    return res.status(400).json({message: "All fields are required"});
}


if (password.length < 8){
return res.status(400).json({message: "Password must be at least 8 characters long"});
}


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)){
    return res.status(400).json({message: "Invalid email format"});
}

const existingUser = await User.findOne({email}) ;
if (existingUser){
    return res.status(400).json({message: "Email is already registered"});
}

const idx = Math.floor(Math.random() * 100) + 1;
const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`
const newUser = await User.create({
    email,
    password,
    fullname,
    profilePic: randomAvatar,
});

try{
    await upserStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullname,
        image: newUser.profilePic || "",
    });
    console.log(`Stream user created for ${newUser.fullname}`);
}
catch(error){
    console.error("Error in creating Stream user:", error);
}


const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{
    expiresIn:'7d',
});

res.cookie("jwt", token, {
    maxAge: 7*24*60*60*1000, //7 days
    httpOnly: true,
    sameSite:"strict",
    secure: process.env.NODE_ENV === "production",
    });

res.status(201).json({success:true, user:newUser});
    } catch(error) {
        console.error("Error in signup controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function login(req, res) {
try{
   const {email, password} = req.body;
   if(!email || !password){
    return res.status(400).json({message: "All fields are required"});
   }

   const user = await User.findOne({email});
   if(!user){
    return res.status(401).json({message: "Invalid email or password"});
   }

   const isPasswordCorrect = await user.matchPassword(password);
   if(!isPasswordCorrect){
    return res.status(401).json({message: "Invalid email or password"});
   }

   // Ensure Stream user exists/is updated on login
   try {
       await upserStreamUser({
           id: user._id.toString(),
           name: user.fullname,
           image: user.profilePic || "",
       });
   } catch (streamError) {
       console.error("Error upserting Stream user on login:", streamError);
   }

   
   const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d',
   });
   res.cookie("jwt", token, {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
   });
   res.status(200).json({success: true, user});



}catch(error){
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
}
}

export function logout(req, res) {
    res.clearCookie("jwt")
    res.status(200).json({success:true, message:"Logged out successfully"});
}


export async function onboard(req, res) {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ],
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        },{new:true})

if(!updatedUser)return res.status(404).json({message: "User not found"});
try{
    await upserStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullname,
        image: updatedUser.profilePic || "",
    });
console.log(`Stream user updated after onboarding for ${updatedUser.fullname}`);
}
catch(streamError){
    console.error("Error in updating Stream user after onboarding:", streamError.message);
}

res.status(200).json({success:true, user: updatedUser});
 } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ message: "Internal server error" });
 }
}

