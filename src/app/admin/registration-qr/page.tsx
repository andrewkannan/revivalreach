"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function RegistrationQRPage() {
  const [registerUrl, setRegisterUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegisterUrl(`${window.location.origin}/register`);
    }
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "10px" }}>Registration QR Code</h1>
      <p style={{ color: "var(--foreground)", opacity: 0.8, marginBottom: "40px" }}>
        Display this QR code for new users to scan and easily navigate to the registration page.
      </p>

      {registerUrl ? (
        <div style={{ background: "white", padding: "40px", borderRadius: "20px", display: "inline-block", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <QRCodeSVG 
            value={registerUrl} 
            size={300} 
            level="H"
            includeMargin={false}
          />
        </div>
      ) : (
        <p>Loading QR Code...</p>
      )}

      <div style={{ marginTop: "40px" }}>
        <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Direct Link:</p>
        <a href={registerUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", wordBreak: "break-all" }}>
          {registerUrl}
        </a>
      </div>
    </div>
  );
}
