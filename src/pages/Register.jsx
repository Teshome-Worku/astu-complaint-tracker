import AuthFormPage from "../components/AuthFormPage";

const registerFields = [
  {
    name: "name",
    label: "Full name",
    placeholder: "Jane Doe",
    type: "text",
    autoComplete: "name",
  },
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
    placeholder: "Create a strong password",
    type: "password",
    autoComplete: "new-password",
  },
];

function Register() {
  return (
    <AuthFormPage
      fields={registerFields}
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
      footerText="Already have an account?"
      submitColorClassName="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
      submitLabel="Create account"
      subtitle="Set up your account to submit and monitor complaints."
      title="Create your account"
    />
  );
}

export default Register;
