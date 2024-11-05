// app/payment/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe('your-publishable-key-here');

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements ) return;
    setLoading(true);

    const cardElement = elements.getElement(CardElement);

  // If CardElement is not available, prevent submission and alert user
  if (!cardElement) {
    alert('Card element is not available');
    return;
  }

  // Set loading state to true to indicate payment is processing
  setLoading(true);

  // Confirm the card payment with the client secret
  const { error, paymentIntent } = await stripe.confirmCardPayment('your-client-secret-here', {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Customer Name', // Replace with actual billing details
      },
    },
  });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      alert('Payment successful');
      router.push('/order-confirmation');
    }
  };

  return (
    <div className="payment-page">
      <h2>Payment Information</h2>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

const Payment = () => (
  <Elements stripe={stripePromise}>
    <PaymentPage />
  </Elements>
);

export default Payment;
