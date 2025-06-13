import nodemailer from 'nodemailer'

export const contact = async (req, res) => {
  const { name, email, mobile, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New Query from ${name}`,
    html: `
      <h2>Your Query Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Rating:</strong> ${mobile}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };
  if (!email || !message || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Send message to admin
    await transporter.sendMail(mailOptions);

    // 2. Send thank-you reply to user
    await transporter.sendMail({
      from: `"NanoSemic" <${process.env.EMAIL_USER}>`, to: email,
      subject: 'Thanks for reaching out!',
      html: `<p>Hi ${name},</p><p>Thank you for contacting us! We'll get back to you shortly.</p><p>-Team NanoSemic</p>`
    });

    res.status(200).json({ message: 'Message sent and reply emailed.' });
  } catch (error) {
    console.error('Error in contact form:', error);
    res.status(500).json({ error: 'Something went wrong. Try again later.' });
  }
}

export const query = async (req, res) => {
  const { email, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `New Feedback from ${email}`,
    html: `
      <h2>Feedback Received</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };
  if (!email || !message ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Send message to admin
    await transporter.sendMail(mailOptions);

    // 2. Send thank-you reply to user
    await transporter.sendMail({
      from: `"NanoSemic" <${process.env.EMAIL_USER}>`, to: email,
      subject: 'Thanks for reaching out!',
      html: `<p>Hi,</p><p>Thank you for contacting us! We'll get back to you shortly.</p><p>-Team NanoSemic</p>`
    });

    res.status(200).json({ message: 'Message sent and reply emailed.' });
  } catch (error) {
    console.error('Error in contact form:', error);
    res.status(500).json({ error: 'Something went wrong. Try again later.' });
  }
}