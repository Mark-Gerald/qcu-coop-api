const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderApprovalEmail = async (order, actionToken) => {
  const acceptUrl = `http://localhost:5000/api/orders/action?token=${actionToken}&action=accept`;
  const declineUrl = `http://localhost:5000/api/orders/action?token=${actionToken}&action=decline`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: #1a2e5a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.4rem;">QCU Cooperative</h1>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 0.875rem;">Order Update</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a2e5a; margin: 0 0 16px;">Your order has been approved! 🎉</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi <strong>${order.student_name}</strong>, your order has been reviewed and approved by the QCU Cooperative staff.
          </p>

          <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #1a2e5a; margin: 0 0 12px; font-size: 0.95rem;">Order Summary</h3>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem;">
                <span style="color: #374151;">${item.product_name} ×${item.quantity}</span>
                <span style="font-weight: bold; color: #1a2e5a;"> ₱${item.subtotal}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 12px 0 0; font-weight: bold;">
              <span>Total: </span>
              <span style="color: #1a2e5a;">₱${order.total_amount}</span>
            </div>
          </div>

          <p style="color: #374151; font-size: 0.9rem; margin-bottom: 24px;">
            Please confirm if you will pick up your order:
          </p>

          <div style="display: flex; gap: 12px; text-align: center;">
            <a href="${acceptUrl}" style="flex: 1; display: block; padding: 14px; background: #059669; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 0.95rem;">
              Received Order
            </a>
            <a href="${declineUrl}" style="flex: 1; display: block; padding: 14px; background: #fee2e2; color: #dc2626; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 0.95rem;">
              Decline Order
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 24px; text-align: center;">
            Pick up location: QCU-Cooperative, 673 Quirino Highway, San Bartolome Novaliches, Quezon City<br>
            Operating hours: Mon-Fri 8AM-5PM, Sat 8AM-12PM
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"QCU Cooperative" <${process.env.EMAIL_USER}>`,
    to: order.student_email,
    subject: 'Your QCU Coop Order Has Been Approved',
    html,
  });
};

const sendOrderDeclineEmail = async (order) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: #1a2e5a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 1.4rem;">QCU Cooperative</h1>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 0.875rem;">Order Update</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #dc2626; margin: 0 0 16px; font-size: 1.2rem;">Your order has been declined</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi <strong>${order.student_name}</strong>, we regret to inform you that your order has been reviewed and could not be processed at this time.
          </p>

          <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #1a2e5a; margin: 0 0 12px; font-size: 0.95rem;">Order Summary</h3>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem;">
                <span style="color: #374151;">${item.product_name} x${item.quantity}</span>
                <span style="font-weight: bold; color: #1a2e5a;">P${item.subtotal}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 12px 0 0; font-weight: bold;">
              <span>Total</span>
              <span style="color: #1a2e5a;">P${order.total_amount}</span>
            </div>
          </div>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #dc2626; margin: 0; font-size: 0.875rem;">
              <strong>Reason:</strong> ${order.admin_note || 'Your order has been declined by the cooperative.'}
            </p>
          </div>

          <p style="color: #374151; font-size: 0.875rem; line-height: 1.6;">
            If you have questions or concerns, please visit or contact the QCU Cooperative directly.
          </p>

          <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 24px; text-align: center;">
            Location: 673 Quirino Highway, San Bartolome, Novaliches, Quezon City<br>
            Operating hours: Mon-Fri 8AM-5PM, Sat 8AM-12PM
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"QCU Cooperative" <${process.env.EMAIL_USER}>`,
    to: order.student_email,
    subject: 'Your QCU Coop Order Has Been Declined',
    html,
  });
};

module.exports = { sendOrderApprovalEmail, sendOrderDeclineEmail };