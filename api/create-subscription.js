import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { paymentMethodId, email, priceId } = req.body;

    if (!paymentMethodId || !email || !priceId) {
      return res.status(400).json({
        error: "Missing required fields: paymentMethodId, email, priceId",
      });
    }

    // 1) Create a customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 2) Create subscription (IMPORTANT: expand payment_intent)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    const paymentIntent = subscription.latest_invoice?.payment_intent;

    // If Stripe didn't give us a PaymentIntent for some reason
    if (!paymentIntent?.client_secret) {
      return res.status(500).json({
        error: "No client_secret returned. Check Stripe priceId and mode.",
      });
    }

    // 3) Return client secret so frontend can confirm payment
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      customerId: customer.id,
    });
  } catch (err) {
    // Return the real Stripe error message to help debugging
    return res.status(500).json({
      error: err?.message || "Server error",
    });
  }
}
