import React, { createContext, useContext, useRef, useState } from "react";

const LoginModalContext = createContext(null);

export const LoginModalProvider = ({ children }) => {
  const [openLoginModal, setOpenLoginModal] = useState(null);
  const pendingOptionsRef = useRef(null);

  const registerOpenModal = (openFn) => {
    setOpenLoginModal(() => openFn);
    if (pendingOptionsRef.current) {
      const pending = pendingOptionsRef.current;
      pendingOptionsRef.current = null;
      openFn(pending);
    }
  };

  const triggerLoginModal = (options = {}) => {
    if (openLoginModal) {
      openLoginModal(options);
    } else {
      pendingOptionsRef.current = options;
    }
  };

  return (
    <LoginModalContext.Provider value={{ registerOpenModal, triggerLoginModal }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return context;
};

