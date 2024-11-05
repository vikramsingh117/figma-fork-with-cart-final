// app/checkout/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/CartItem';  // Import reusable CartItem component

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const handleRemoveFromCart = (id: number) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleProceedToShipping = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/shipping');  // Navigate to shipping page
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="checkout-page">
      <h2>Review Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} onRemove={handleRemoveFromCart} />
        ))}
      </div>

      <div className="cart-summary">
        <div>Total: ${totalPrice.toFixed(2)}</div>
      </div>

      <button onClick={handleProceedToShipping}>Proceed to Shipping</button>
    </div>
  );
};

export default CheckoutPage;
