import './App.css';
import axios from 'axios';
import React, { useState } from 'react';

function App() {
  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState([]);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      const { data } = await axios.post("http://localhost:3000/orders", {
        amount: amount,
        currency: "INR"
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      handleRazorpayScreen(data.order_id, data.amount);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleRazorpayScreen = async (orderId, amount) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Failed to load Razorpay");
      return;
    }

    const options = {
      key: 'rzp_test_oP8rbwETBxlRsU',
      amount: amount,
      currency: 'INR',
      name: "Papaya Coders",
      description: "Payment to Papaya Coders",
      order_id: orderId,
      handler: function (response) {
        setResponseId(response.razorpay_payment_id);
      },
      prefill: {
        name: "Papaya Coders",
        email: "papayacoders@gmail.com"
      },
      theme: {
        color: "#F4C430"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };




  const paymentFetch = async (e) => {
    e.preventDefault();
    const paymentId = e.target.paymentId.value;

    try {
      const { data } = await axios.get(`http://localhost:3000/payment/${paymentId}`);
      setResponseState(data);
    } catch (error) {
      console.error("Error fetching payment:", error);
    }
  };

  return (
    <div className="App">
      <button onClick={() => createRazorpayOrder(100)}>Pay ₹100</button>
      {responseId && <p>Payment ID: {responseId}</p>}

      <h1>Payment Verification</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name="paymentId" placeholder="Enter Payment ID" required />
        <button type="submit">Fetch Payment</button>
      </form>

      {responseState && (
        <ul>
          <li>Amount: ₹{responseState.amount}</li>
          <li>Currency: {responseState.currency}</li>
          <li>Status: {responseState.status}</li>
          <li>Method: {responseState.method}</li>
        </ul>
      )}
    </div>
  );
}

export default App;
