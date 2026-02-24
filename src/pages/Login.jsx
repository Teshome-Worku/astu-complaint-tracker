import AuthFormPage from "../components/AuthFormPage";

const loginFields = [
  {
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    autoComplete: "current-password",
  },
];

function Login() {
  return (
    <AuthFormPage
      fields={loginFields}
      footerLinkLabel="Register"
      footerLinkTo="/register"
      footerText="Need an account?"
      submitColorClassName="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
      submitLabel="Sign in"
      subtitle="Access your dashboard to track and manage complaints."
      title="Welcome back"
    />
  );
}

export default Login;
