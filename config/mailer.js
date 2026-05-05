const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderApprovalEmail = async (order, actionToken) => {
  const acceptUrl = `https://qcu-coop-api.onrender.com/api/orders/action?token=${actionToken}&action=accept`;
  const declineUrl = `https://qcu-coop-api.onrender.com/api/orders/action?token=${actionToken}&action=decline`;

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
          <h2 style="color: #1a2e5a; margin: 0 0 16px;">Your order has been approved!</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi <strong>${order.student_name}</strong>, your order has been reviewed and approved by the QCU Cooperative staff.
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
              <span>Total:</span>
              <span style="color: #1a2e5a;">P${order.total_amount}</span>
            </div>
          </div>
          <p style="color: #374151; font-size: 0.9rem; margin-bottom: 24px;">
            Please confirm if you will pick up your order:
          </p>
          <div style="text-align: center;">
            <a href="${acceptUrl}" style="display: inline-block; margin: 8px; padding: 14px 28px; background: #059669; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 0.95rem;">
              Received Order
            </a>
            <a href="${declineUrl}" style="display: inline-block; margin: 8px; padding: 14px 28px; background: #fee2e2; color: #dc2626; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 0.95rem;">
              Decline Order
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 24px; text-align: center;">
            Pick up: 673 Quirino Highway, San Bartolome Novaliches, Quezon City<br>
            Mon-Fri 8AM-5PM, Sat 8AM-12PM
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sgMail.send({
    from: process.env.EMAIL_USER,  // must be your verified sender in SendGrid
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
          <h2 style="color: #dc2626; margin: 0 0 16px;">Your order has been declined</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi <strong>${order.student_name}</strong>, we regret to inform you that your order could not be processed.
          </p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="color: #dc2626; margin: 0; font-size: 0.875rem;">
              <strong>Reason:</strong> ${order.admin_note || 'Your order has been declined by the cooperative.'}
            </p>
          </div>
          <p style="color: #374151; font-size: 0.875rem;">
            Please visit the QCU Cooperative for more information.
          </p>
          <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 24px; text-align: center;">
            673 Quirino Highway, San Bartolome, Novaliches, Quezon City<br>
            Mon-Fri 8AM-5PM, Sat 8AM-12PM
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sgMail.send({
    from: process.env.EMAIL_USER,
    to: order.student_email,
    subject: 'Your QCU Coop Order Has Been Declined',
    html,
  });
};

module.exports = { sendOrderApprovalEmail, sendOrderDeclineEmail };