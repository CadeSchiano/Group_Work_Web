import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,_#07111f,_#10203a_46%,_#18304d)] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mint/80">Privacy Policy</p>
            <h1 className="mt-3 font-display text-4xl">How Group Project Hub handles account and project data.</h1>
          </div>
          <Link className="text-sm text-mint transition hover:text-white" to="/">
            Back to home
          </Link>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-7 text-mist/80">
          <section>
            <h2 className="font-display text-2xl text-white">Information we collect</h2>
            <p className="mt-2">
              Group Project Hub stores the account information you provide during signup, including your name, email address, and encrypted password. The app also stores group details, tasks, roadmap items, and files uploaded by group members.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white">How we use information</h2>
            <p className="mt-2">
              We use account and project data to provide authentication, group collaboration features, task tracking, file sharing, and progress reporting within the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white">File storage</h2>
            <p className="mt-2">
              Files uploaded to a group are stored on the application server and are intended to be accessible to members of that group. Do not upload highly sensitive personal, financial, or regulated information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white">Advertising</h2>
            <p className="mt-2">
              Group Project Hub may display advertising content from Google AdSense or other advertising partners. These providers may use cookies or similar technologies to serve and measure ads, subject to their own privacy terms and policies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-white">Contact</h2>
            <p className="mt-2">
              If you have questions about this policy or the handling of your data, contact cadeschiano8@yahoo.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
