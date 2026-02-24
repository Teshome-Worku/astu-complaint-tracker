import { Link } from "react-router-dom";

const inputClassName =
  "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
const labelClassName = "block text-sm font-medium text-slate-700";
const buttonClassName =
  "mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2";

function AuthFormPage({
  title,
  subtitle,
  fields,
  submitLabel,
  submitColorClassName,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-300/60">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

        <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className={labelClassName}>{field.label}</span>
              <input
                autoComplete={field.autoComplete}
                className={inputClassName}
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type}
              />
            </label>
          ))}

          <button className={`${buttonClassName} ${submitColorClassName}`} type="submit">
            {submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link className="font-semibold text-indigo-700 hover:text-indigo-600" to={footerLinkTo}>
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default AuthFormPage;
