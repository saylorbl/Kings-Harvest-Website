require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Ensure Stripe keys are present before initializing the SDK
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLIC_KEY) {
  console.error('Missing STRIPE_SECRET_KEY or STRIPE_PUBLIC_KEY in environment.');
  console.error('Please add them to your .env file and restart the server.');
  // Don't exit here to allow the server to start for static debugging if desired,
  // but log prominently so devs notice. You can uncomment the next line to force exit.
  // process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Make STRIPE_PUBLIC_KEY available to frontend
app.get('/config', (req, res) => {
  try {
    if (!process.env.STRIPE_PUBLIC_KEY) {
      console.error('STRIPE_PUBLIC_KEY is missing from environment variables');
      return res.status(500).json({
        error: 'Server misconfigured: STRIPE_PUBLIC_KEY not set',
        details: 'Please ensure STRIPE_PUBLIC_KEY is defined in your .env file'
      });
    }
    
    res.json({
      publicKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    //console.error('Error in /config endpoint:', error);
    res.status(500).json({
      error: 'Failed to get Stripe configuration',
      message: error.message
    });
  }
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, name, email, donationType } = req.body;

    // Validate input
    if (!amount || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Amount in cents
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      description: `Church Donation - ${name}`,
      metadata: {
        name: name,
        email: email,
        donationType: donationType || 'general'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for payment completion
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    //console.log('Payment succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Make sure to set STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY in .env`);
});
