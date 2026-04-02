import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, title, company, email, phone, location, services, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "martinet.o2switch.net",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || "info@protectionsecuritygroup.com",
          pass: process.env.SMTP_PASS || "Ko=i&223(P5+.7v6",
        },
      });

      const mailOptions = {
        from: `"Protection Security Group Contact" <${process.env.SMTP_USER || "info@protectionsecuritygroup.com"}>`,
        to: process.env.CONTACT_RECIPIENTS || "info@protectionsecuritygroup.com,maganda.igor@gmail.com",
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `
          Name: ${name}
          Title: ${title}
          Company: ${company}
          Email: ${email}
          Phone: ${phone}
          Location: ${location}
          Services Requested: ${services.join(", ")}
          
          Message:
          ${message}
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Services Requested:</strong> ${services.join(", ")}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
