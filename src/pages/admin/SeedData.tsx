import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react";
import { seedDatabase } from "@/lib/seedData";

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await seedDatabase();
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to seed database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Seed Database
          </CardTitle>
          <CardDescription>
            Initialize Firestore with mock data for demonstration purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Database seeded successfully!</p>
                  <ul className="list-disc list-inside text-sm mt-2">
                    <li>{result.accountHolders} Account Holders</li>
                    <li>{result.courses} Courses</li>
                    <li>{result.enrollments} Enrollments</li>
                    <li>{result.charges} Course Charges</li>
                    <li>{result.transactions} Transactions</li>
                    <li>{result.rules} Top-up Rules</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">What will be created:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                5 sample account holders with varying education levels and
                statuses
              </li>
              <li>
                4 courses from different institutions (polytechnics,
                universities)
              </li>
              <li>5 student enrollments in various courses</li>
              <li>7 course fee charges (some paid, some pending)</li>
              <li>7 financial transactions (top-ups and payments)</li>
              <li>4 top-up rules for batch processing</li>
            </ul>
          </div>

          <Button
            onClick={handleSeed}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-5 w-5" />
                Seed Database Now
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            <strong className="text-destructive">⚠️ Warning:</strong> This will
            <strong className="text-destructive">
              {" "}
              DELETE ALL existing data
            </strong>{" "}
            from your Firestore database before seeding new mock data. This
            action cannot be undone. Make sure you're using a test environment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
