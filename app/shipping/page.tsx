// app/shipping/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ShippingPage = () => {
  const router = useRouter();
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !shippingInfo.name ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.postalCode ||
      !shippingInfo.phone
    ) {
      alert('Please fill in all fields!');
      return;
    }

    // Store shipping info in localStorage
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

    // Navigate to payment page
    router.push('/payment');
  };

  return (
    <div className="shipping-page">
      <h2>Shipping Information</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={shippingInfo.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={shippingInfo.address}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={shippingInfo.city}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={shippingInfo.postalCode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={shippingInfo.phone}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default ShippingPage;
