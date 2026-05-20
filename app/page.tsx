export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="text-center">
        <h1
          className="text-h1 font-medium"
          style={{ color: "var(--accent)" }}
        >
          BuiltUp
        </h1>
        <p
          className="mt-2 text-body"
          style={{ color: "var(--text-secondary)" }}
        >
          Your workout tracker is being built.
        </p>
      </div>
    </main>
  );
}
