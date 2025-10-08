import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="308002675488-t2b7tf6ndhl5dg4u31hr7fcrm7l31gmp.apps.googleusercontent.com">
    <BrowserRouter>
      <Provider store={store}>
        <StrictMode>
          <App />
        </StrictMode>
      </Provider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);