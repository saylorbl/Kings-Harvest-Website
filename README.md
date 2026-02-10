# TKH Church Donations

A modern, secure donation website for TKH Church built with Node.js/Express and Stripe payment processing.

## Features

- 🎁 Beautiful, responsive donation form
- 💳 Secure Stripe payment integration
- 📧 Collects donor name, email, and donation amount
- 🏦 Support for different donation types (general, missions, building fund, youth ministry)
- 🔐 PCI-compliant card handling
- 📱 Mobile-responsive design
- 🌐 Real-time form validation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account (free to create at https://stripe.com)

## Installation

1. **Clone or extract the project**

   ```bash
   cd TKHdonations
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Get your Stripe API keys from https://dashboard.stripe.com/apikeys
   - Update `.env` with your Stripe keys:
     ```
     STRIPE_SECRET_KEY=sk_test_your_secret_key_here
     STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
     PORT=3000
     NODE_ENV=development
     ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
TKHdonations/
├── server.js                 # Express server configuration
├── package.json              # Node.js dependencies
├── .env.example              # Environment variables template
├── .github/
│   └── copilot-instructions.md
├── public/
│   ├── index.html           # Landing page with donation form
│   ├── css/
│   │   └── style.css        # Styling
│   └── js/
│       └── donation.js      # Stripe integration logic
└── README.md
```

## How It Works

1. **Donation Form** - Users enter their name, email, donation amount, and select a donation type
2. **Card Information** - Stripe's secure Card Element collects payment details (never touches your server)
3. **Payment Intent** - Server creates a Stripe Payment Intent with donor information
4. **Payment Confirmation** - Client confirms payment through Stripe
5. **Success Confirmation** - User receives confirmation message and redirect

## Stripe Integration Details

### Payment Processing Flow

- The form collects donor information (name, email, amount)
- Client-side JavaScript sends data to `/create-payment-intent` endpoint
- Server creates a Stripe PaymentIntent (securely server-side)
- Client receives client secret to confirm payment
- Stripe Card Element handles secure card data (PCI-compliant)
- Payment is confirmed and processed through Stripe

### Webhook Support

The app includes webhook support for payment completion events. To enable:

1. Set up a webhook in your Stripe Dashboard pointing to your app's `/webhook` endpoint
2. Add your webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

## Security Notes

- **Never commit `.env` file** - it contains sensitive Stripe keys
- **Card data never touches your server** - Stripe handles all sensitive data via secure tokens
- **Always use HTTPS in production** - Stripe requires secure connections
- **Validate server-side** - The app validates all inputs on the server
- **Store webhook secret safely** - Required for verifying Stripe webhooks

## Testing

### Using Stripe Test Cards

Stripe provides test card numbers for different scenarios:

- **Successful payment**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined card**: `4000 0000 0000 0002`

Use expiration date: Any future date (e.g., 12/25)
Use CVC: Any 3 digits (e.g., 123)

## Customization

### Donation Types

Edit the donation types in `public/index.html` in the `<select>` element:

```html
<option value="general">General Donation</option>
<option value="missions">Missions</option>
<option value="building">Building Fund</option>
<option value="youth">Youth Ministry</option>
```

### Styling

Modify `public/css/style.css` to match your church branding:

- Update color variables at the top of the file
- Adjust layout, fonts, and spacing as needed

### Server Configuration

Edit `server.js` to:

- Add database integration for storing donations
- Implement email confirmations
- Add admin dashboard for viewing donations
- Customize metadata sent to Stripe

## Deployment

### Heroku

```bash
heroku create your-app-name
heroku config:set STRIPE_SECRET_KEY=your_key
heroku config:set STRIPE_PUBLIC_KEY=your_key
git push heroku main
```

### Vercel/Netlify

The backend requires a Node.js server, so Vercel or Netlify serverless functions would need to be configured for the API endpoints.

### Docker

Create a `Dockerfile` to containerize the application for deployment.

## Troubleshooting

### "Stripe is not defined"

- Ensure the Stripe script is loaded: `<script src="https://js.stripe.com/v3/"></script>`
- Check browser console for network errors

### "Invalid API Key"

- Verify your Stripe keys are correctly copied to `.env`
- Make sure you're using TEST keys during development (they start with `pk_test_` and `sk_test_`)

### Payment failed

- Check Stripe Dashboard for error details
- Ensure amount is greater than 0
- Verify card information is valid (use test cards)

## Support

For Stripe API documentation, visit: https://stripe.com/docs
For issues with this application, check the server logs for error messages.

## License

ISC

## Contributing

Feel free to submit pull requests or open issues for bugs and feature suggestions.
