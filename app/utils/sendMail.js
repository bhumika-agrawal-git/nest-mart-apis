import transporter from "../configs/nodemailer.js";

export const sendRegistrationMail = async (
  name,
  email
) => {
  await transporter.sendMail({
    from: `"Nest Mart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Nest Mart 🎉",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Welcome to Nest Mart</h2>

        <p>Hello <strong>${name}</strong>,</p>

        <p>Your account has been created successfully.</p>

        <table style="border-collapse:collapse">
          <tr>
            <td><strong>Name</strong></td>
            <td>: ${name}</td>
          </tr>

          <tr>
            <td><strong>Email</strong></td>
            <td>: ${email}</td>
          </tr>
        </table>

        <br>

        <p>
          Thank you for choosing
          <strong>Nest Mart</strong>.
        </p>

        <p>
          Happy Shopping 🛒
        </p>
      </div>
    `,
  });
};