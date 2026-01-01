import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    // 1) Put your Stripe Price ID here (starts with price_)
    const PRICE_ID = "price_YOUR_PRICE_ID_HERE";

    // 2) Create a Checkout Session for a subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],

      // These are where Stripe sends the user after paying
      success_url: "https://www.donationheaven.com/success",
      cancel_url: "https://www.donationheaven.com/canceled",
    });

    // 3) Send the checkout link back to your site
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Stripe error",
    });
  }
}
