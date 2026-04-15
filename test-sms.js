const twilio = require('twilio');

const client = twilio(
  'ACebd6e0e86f19a9b922ef9421cfafce61',
  'cfb82c4aba79af9734cdc4c833e32b15'
);

client.messages.create({
  body: '🚀 Pick.UP Test: SMS is working! Ready to launch!',
  from: '+16193496557',
  to: '+16192085159'
}).then(msg => {
  console.log('✅ SMS Sent!', msg.sid);
}).catch(err => {
  console.error('❌ Error:', err.message);
});
