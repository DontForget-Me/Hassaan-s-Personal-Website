export default function Footer() {
  return (
    <footer
      className="border-t py-12"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="text-sm font-semibold gradient-text">MHK</span>
        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Muhammad Hassaan Khan
        </p>
      </div>
    </footer>
  );
}
