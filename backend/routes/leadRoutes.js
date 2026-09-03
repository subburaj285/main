import express from "express";
import { sendLeadEmail } from "../utils/emailService.js";

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/leads
 * Public endpoint to submit a website demo/lead request
 */
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, business } = req.body || {};

    // 1. Validate fullName (required)
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    // 2. Validate email (required & valid format)
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // 3. Validate phone (required)
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    // Prepare clean lead data
    const leadData = {
      fullName: fullName.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      business: business && typeof business === "string" ? business.trim() : "",
    };

    // 4. Send Gmail SMTP notification email to shreeandal.ai@gmail.com
    const emailResult = await sendLeadEmail(leadData);

    return res.status(200).json({
      success: true,
      message: "Lead notification sent successfully.",
      printedToConsole: emailResult?.printedToConsole || false,
    });
  } catch (error) {
    console.error("❌ Lead Submission Route Error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to process lead notification. Please try again.",
    });
  }
});

export default router;
