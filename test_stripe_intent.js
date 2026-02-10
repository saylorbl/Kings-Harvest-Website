require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async function(){
  try{
    console.log('Using secret key prefix:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0,6) : '(none)');
    const intent = await stripe.paymentIntents.create({
      amount: 50,
      currency: 'usd',
      description: 'Test intent from local script'
    });
    console.log('Created test PaymentIntent:', intent.id);
  }catch(err){
    console.error('Test PaymentIntent error:', err && err.type ? err.type : err);
    console.error(err);
    process.exit(1);
  }
})();