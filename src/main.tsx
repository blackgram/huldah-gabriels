import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./Redux/store.ts";
import { BrowserRouter as Router } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// PayPal Client ID - should be in environment variables
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            currency: "USD",
            intent: "capture",
          }}
        >
          <App />
        </PayPalScriptProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);
