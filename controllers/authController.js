const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('signup', { 
        error: 'User already exists with this email',
        name,
        email
      });
    }

    // Generate verification code
    const verificationCode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });

    // Create new user
    user = new User({
      name,
      email,
      password,
      verificationCode
    });

    await user.save();

    // Send verification email
    const emailSent = await sendEmail(
      email,
      '🎉 Welcome to Shop Sphere!',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #cc0000; border-radius: 10px; background-color: #ffe6e6;">
        <h1 style="color: #cc0000; text-align: center;">🔥 Welcome to Shop Sphere! 🛍️</h1>
       <p style="font-size: 16px; color: #990000;">Hello <strong>${user.name}</strong>,</p>
      <h4  style="color: #cc0000;" >Your verification code is: </h4>
      <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 24px; font-weight: bold; color: white; background-color: #cc0000; padding: 10px 20px; border-radius: 5px;">${verificationCode}</span>
      </div>
       <p style="font-size: 16px; color: #990000;">Thank you for signing up at <strong>Shop Sphere</strong>! Get ready for a fantastic shopping experience with exclusive deals and discounts.</p>
        </div>`
    );
  //   email,
  //   '🎉 Welcome to Shop Sphere!',
  //   `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #cc0000; border-radius: 10px; background-color: #ffe6e6;">
  //     <h1 style="color: #cc0000; text-align: center;">🔥 Welcome to Shop Sphere! 🛍️</h1>
  //     <p style="font-size: 16px; color: #990000;">Hello <strong>${user.name}</strong>,</p>
  //     <p style="font-size: 16px; color: #990000;">Thank you for signing up at <strong>Shop Sphere</strong>! Get ready for a fantastic shopping experience with exclusive deals and discounts.</p>
  //   </div>`
  // );
 
    if (!emailSent) {
      return res.render('signup', { 
        error: 'Failed to send verification email. Please try again.',
        name,
        email
      });
    }

    // Redirect to verification page
    res.redirect(`/verify?email=${email}`);
    
  } catch (error) {
    console.error('Signup error:', error.message);
    res.render('signup', { 
      error: 'An error occurred during signup. Please try again.'
    });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check if email is provided
    if (!email) {
      return res.render("verify", { error: "Email is required." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("verify", { 
        error: "User not found.",
        email
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.render("login", { 
        success: "Your email is already verified. Please login."
      });
    }

    // Check verification code
    if (user.verificationCode !== code) {
      return res.render("verify", { 
        error: "Invalid verification code.",
        email
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = null;  // Clear the verification code
    await user.save();

    // Redirect to login page with success message
    res.render("login", { success: "Account created successfully! You can now log in.", error: null });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.render("verify", { 
      error: "An error occurred during verification. Please try again.",
      email
    });
  }
};


// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { 
        error: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new verification code
      const verificationCode = randomstring.generate({
        length: 6,
        charset: 'numeric'
      });
      
      user.verificationCode = verificationCode;
      await user.save();
      
      // Send verification email again
      await sendEmail(
      //   email ,
      //   'Shop Sphere Account Verification',
      //   `<h1 color:rgb(255, 48, 48);>Email Verification</h1>
      //   <p>Hello ${user.name},</p>
      //   <p>Your account is not verified yet. Your new verification code is: <strong style="color: red; font-size: 24px;">${verificationCode}</strong></p>
      //   <p>Please enter this code on the verification page to complete your registration.</p>`
      // );
      email,
      '🎉 Welcome to Shop Sphere!',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #cc0000; border-radius: 10px; background-color: #ffe6e6;">
        <h1 style="color: #cc0000; text-align: center;">🔥 Welcome to Shop Sphere! 🛍️</h1>
       <p style="font-size: 16px; color: #990000;">Hello <strong>${user.name}</strong>,</p>
      <h4  style="color: #cc0000;" >Your verification code is: </h4>
      <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 24px; font-weight: bold; color: white; background-color: #cc0000; padding: 10px 20px; border-radius: 5px;">${verificationCode}</span>
      </div>
       <p style="font-size: 16px; color: #990000;">Thank you for signing up at <strong>Shop Sphere</strong>! Get ready for a fantastic shopping experience with exclusive deals and discounts.</p>
        </div>`
    );
      
      return res.redirect(`/verify?email=${email}`);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { 
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Store token in session
    req.session.token = token;
    
    // Redirect to the shop-sphere website
    res.redirect(process.env.REDIRECT_URL);
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.render('login', { 
      error: 'An error occurred during login. Please try again.'
    });
  }
};

// Forgot password controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('forgot-password', { 
        error: 'User with this email does not exist'
      });
    }

    // Generate reset code
    const resetCode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });

    // Set reset code and expiry (1 hour)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset code email
    const emailSent = await sendEmail(
    //   email,
    //   'Shop Sphere Password Reset Code',
    //   `<h1 color:rgb(255, 48, 48);>Password Reset</h1>
    //   <p>Hello ${user.name},</p>
    //   <p>You requested a password reset. Your password reset code is: <strong style="color: red; font-size: 24px;">${resetCode}</strong></p>
    //   <p>This code will expire in 1 hour.</p>
    //   <p>If you didn't request this, please ignore this email.</p>`
    // );
    email,
  '🔒 Shop Sphere Password Reset Request',
  `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #cc0000; border-radius: 10px; background-color: #ffe6e6;">
    <h1 style="color: #cc0000; text-align: center;">Reset Your Password 🔑</h1>
    <p style="font-size: 16px; color: #990000;">Hello <strong>${user.name}</strong>,</p>
    <p style="font-size: 16px; color: #990000;">We received a request to reset your password. Use the following code:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 24px; font-weight: bold; color: white; background-color: #cc0000; padding: 10px 20px; border-radius: 5px;">${resetCode}</span>
    </div>
    <p style="font-size: 16px; color: #990000;">This code will expire in 1 hour. If you did not request this, please ignore this email.</p>
    <p style="font-size: 14px; color: #990000; text-align: center;">Need help? Reach out at <a href="mailto:support@shopsphere.com" style="color: #cc0000; font-weight: bold;">ankanghorai32@gmail.com</a>.</p>
  </div>`
);

    if (!emailSent) {
      return res.render('forgot-password', { 
        error: 'Failed to send reset code. Please try again.'
      });
    }

    // Redirect to reset password page
    res.redirect(`/reset-password?email=${email}`);
    
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.render('forgot-password', { 
      error: 'An error occurred. Please try again.'
    });
  }
};



// Reset password controller
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        console.log("Received reset request for:", email, "Code:", code); // Debugging

        // Find user with matching email, code, and non-expired reset token
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log("User not found or reset code expired.");
            return res.render('reset-password', {
                error: 'Invalid or expired reset code.', 
                success: '', 
                email 
            });
        }

        // Ensure the password is not empty or null
        if (!password || password.trim() === '') {
            return res.render('reset-password', { 
                error: 'Password cannot be empty.', 
                success: '', 
                email 
            });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token
        await User.updateOne(
            { email }, 
            { 
                $set: { password: hashedPassword },
                $unset: { resetPasswordCode: "", resetPasswordExpires: "" }
            }
        );

        console.log("Password successfully updated for", email);

        res.render('login', { 
            error: '', 
            success: 'Password has been reset successfully. You can now login with your new password.' 
        });

    } catch (error) {
        console.error("Reset password error:", error.message);
        res.render('reset-password', { 
            error: 'An error occurred. Please try again.', 
            success: '', 
            email: req.body.email 
        });
    }
};


// Logout controller
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

// Get signup page
exports.getSignupPage = (req, res) => {
  res.render('signup', { error: null });
};

// Get login page
exports.getLoginPage = (req, res) => {
  res.render('login', { error: null, success: null });
};

// Get verify page
exports.getVerifyPage = (req, res) => {
  const { email } = req.query;
  res.render('verify', { error: null, email });
};

// Get forgot password page
exports.getForgotPasswordPage = (req, res) => {
  res.render('forgot-password', { error: null });
};

// Get reset password page
exports.getResetPasswordPage = (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { error: null, email });
};