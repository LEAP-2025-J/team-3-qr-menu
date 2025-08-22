import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Page Not Found
          </CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Sorry, we couldn't find the page you requested. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-in">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
