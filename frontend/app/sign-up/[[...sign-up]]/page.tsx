import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors",
            card: "shadow-xl max-w-md mx-auto",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-500",
            formFieldLabel: "text-gray-700 font-medium",
            formFieldInput: "border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg",
            footerActionLink: "text-purple-600 hover:text-purple-700",
          },
        }}
      />
    </div>
  );
}
