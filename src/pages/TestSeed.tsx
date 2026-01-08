import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/lib/seedData";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function SimpleSeedTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Starting seed...");
      const res = await seedDatabase();
      console.log("Seed result:", res);
      setResult(res);
    } catch (err: any) {
      console.error("Seed error:", err);
      setError(err.message || "Failed to seed database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Seed Database Test</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Success!</p>
              <ul className="text-green-700 text-sm mt-1">
                <li>Account Holders: {result.accountHolders}</li>
                <li>Courses: {result.courses}</li>
                <li>Enrollments: {result.enrollments}</li>
                <li>Charges: {result.charges}</li>
                <li>Transactions: {result.transactions}</li>
                <li>Rules: {result.rules}</li>
              </ul>
            </div>
          </div>
        )}

        <Button onClick={handleSeed} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            "Seed Database"
          )}
        </Button>

        <div className="mt-4 text-sm text-gray-600">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2">
            <li>10 Account Holders</li>
            <li>7 Courses</li>
            <li>8 Enrollments</li>
            <li>7 Course Charges</li>
            <li>7 Transactions</li>
            <li>4 Top-up Rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
