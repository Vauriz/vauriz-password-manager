import './globals.css';

export const metadata = {
  title: 'Vauriz — Password Manager',
  description: 'Secure password manager with client-side encryption. Store, manage, and access your credentials safely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
