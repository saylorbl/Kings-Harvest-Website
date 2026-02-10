let stripe, elements, cardElement;

// Initialize Stripe
async function initializeStripe() {
  try {
    const response = await fetch('/config');
    
    // Check for HTTP errors
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMsg = `Server error (${response.status})`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // Fallback to plain text/HTML
          errorMsg = await response.text();
        }
      } else {
        errorMsg = await response.text();
      }
      
      //console.error('Config endpoint returned error:', errorMsg);
      //throw new Error(`Failed to load Stripe config: ${errorMsg}`);
    }
    
    // Parse response as JSON with error handling
    let config;
    try {
      config = await response.json();
    } catch (jsonError) {
      //console.error('Response was not valid JSON. Response status:', response.status);
      //console.error('Response text:', await response.text());
      throw new Error('Server returned invalid JSON (possibly an error page)');
    }
    
    // Validate the config
    if (!config.publicKey) {
      throw new Error('No publicKey in server config response');
    }
    
    stripe = Stripe(config.publicKey);
    if (!stripe) {
      throw new Error('Failed to initialize Stripe SDK');
    }
    console.log('Stripe initialized successfully with public key:', config.publicKey.substring(0, 10) + '...');
    elements = stripe.elements();
    cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Handle card element changes
    cardElement.addEventListener('change', displayError);

    // Enable submit button once card is complete
    cardElement.addEventListener('change', function(event) {
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = !event.complete;
    });
  } catch (error) {
    //console.error('Error initializing Stripe:', error.message || error);
    displayPaymentStatus('Failed to initialize payment. Please ensure the server is running and STRIPE_PUBLIC_KEY is configured.', 'error');
  }
}

// Handle form submission
document.getElementById('donation-form').addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(e) {
    //console.log("button pressed");
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const submitBtn = document.getElementById('submit-btn');

  // Validate inputs
  if (!name || !email || !amount || amount <= 0) {
    displayPaymentStatus('Please fill in all required fields.', 'error');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  displayPaymentStatus('Processing your donation...', 'loading');

  try {
    // Create payment intent
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        name: name,
        email: email,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const paymentData = await response.json();

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentData.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name,
            email: email
          }
        }
      }
    );

    if (error) {
      displayError({ message: error.message });
      submitBtn.disabled = false;
    } else if (paymentIntent.status === 'succeeded') {
      displayPaymentStatus(
        `Success! Thank you for your $${amount.toFixed(2)} donation. A confirmation has been sent to ${email}.`,
        'success'
      );
      // Clear form
      document.getElementById('donation-form').reset();
      cardElement.clear();
      submitBtn.disabled = true;

      // Redirect after 5 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } else if (paymentIntent.status === 'requires_action') {
      displayPaymentStatus('Please complete the additional authentication required.', 'loading');
    }
  } catch (error) {
    //console.error('Error processing payment:', error);
    displayPaymentStatus('An error occurred while processing your donation. Please try again.', 'error');
    submitBtn.disabled = false;
  }
}

// Display card errors
function displayError(event) {
  const errorElement = document.getElementById('card-errors');
  if (event.error) {
    errorElement.textContent = event.error.message;
  } else {
    errorElement.textContent = '';
  }
}

// Display payment status
function displayPaymentStatus(message, status) {
  const statusElement = document.getElementById('payment-status');
  statusElement.textContent = '';
  statusElement.className = `payment-status ${status}`;

  if (status === 'loading') {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    statusElement.appendChild(spinner);
  }

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  statusElement.appendChild(messageSpan);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeStripe);
