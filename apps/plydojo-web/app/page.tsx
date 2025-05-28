import { Button } from "@plydojo/plydojo-ui/components/button";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to PlyDojo</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Interactive Chess Tutoring Platform
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {/* Placeholder cards for future functionality */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Start Learning</h2>
            <p className="text-muted-foreground mb-4">
              Begin your chess journey with AI-powered tutoring
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">View History</h2>
            <p className="text-muted-foreground mb-4">
              Review your past games and progress
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Customize Settings</h2>
            <p className="text-muted-foreground mb-4">
              Personalize your learning experience
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
