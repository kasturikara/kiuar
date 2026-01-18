// App Footer component
export const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <p>© {new Date().getFullYear()} - QR Code Generator</p>
      </aside>
    </footer>
  );
};
