import React, { useState } from "react";
import Modal from "react-modal";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Set modal root (important for accessibility)
Modal.setAppElement("#root");

const PaymentForm = ({ onClose }: { onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Track success state

  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      // Call backend to create payment intent
      const { data } = await axios.post(
        `${BASE_URL}/subscription/create-payment-intent`,
        {
          userId,
        }
      );
      const clientSecret = data.clientSecret;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setStatus(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent.status === "succeeded") {
        // Confirm the payment in the backend

        console.log(result);

        const transactionId = result.paymentIntent.id;
        const purpose = "file-translation"; // Example purpose

        await axios.post(`${BASE_URL}/subscription/confirm-payment`, {
          userId,
          transactionId,
          purpose,
        });

        setStatus(""); // Clear status message
        setShowSuccess(true); // Show success message
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setStatus("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return showSuccess ? (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
      <p className="text-sm text-gray-600">
        Thank you for your payment. You can now translate your files.
      </p>
      <button
        onClick={onClose}
        className="mt-4 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 text-center">Pay $1.99</h2>
      <p className="text-sm text-gray-600 text-center">
        You need to pay $1.99 to translate additional files.
      </p>
      <div className="bg-gray-100 p-4 rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#fa755a" },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Pay $1.99"}
      </button>
      <p className="text-center text-sm text-red-500">{status}</p>
    </form>
  );
};

const PaymentPage = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 relative"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>
      <Elements stripe={stripePromise}>
        <PaymentForm onClose={onClose} />
      </Elements>
    </Modal>
  );
};

export default PaymentPage;
