export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">ShopRewards Hub</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Multi-tenant SaaS rewards platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/setup"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Start Setup Wizard
          </a>
        </div>
      </div>
    </main>
  );
}
