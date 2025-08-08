import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-4/5 py-12">
      <h1 className="mb-6 text-4xl font-bold">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Effective date:</strong> August 8, 2025
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">1. Who We Are</h2>
        <p>
          HEMU-AI is a math editor powered by AI. We are based in Finland and
          operate in accordance with the General Data Protection Regulation
          (GDPR). For privacy‐related inquiries, contact us at{" "}
          <a
            href="mailto:mrnaakka@gmail.com"
            className="text-teal-600 underline"
          >
            mrnaakka@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">2. What Data We Collect</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Authentication Information:</strong> We use{" "}
            <a href="https://clerk.dev/" className="text-teal-600 underline">
              Clerk
            </a>{" "}
            to manage user authentication. Clerk may collect your email or other
            info required for sign-in. See Clerk’s policy for details.
          </li>
          <li>
            <strong>Uploaded Content:</strong> Images you upload are stored in{" "}
            Cloudflare R2; text and exercises are stored in our Neon database.
          </li>
          <li>
            <strong>AI Interaction Data:</strong> We send your inputs (math
            problems and images) to OpenAI, and we store both your inputs and
            the AI’s responses to let you revisit your work.
          </li>
          <li>
            <strong>Subscription &amp; Billing:</strong> Payments are processed
            via Stripe; we do not store your card details. See{" "}
            <a
              href="https://stripe.com/privacy"
              className="text-teal-600 underline"
            >
              Stripe’s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Technical Data:</strong> We may store IP addresses in the
            future for security and analytics. We will update this policy if we
            do.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">3. How We Use Your Data</h2>
        <p>
          We use your data to authenticate you, provide AI-powered math help,
          store and display your exercises, process payments, and secure our
          platform. We do not use your data for marketing or sell it to third
          parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          4. Children and Young Users
        </h2>
        <p>
          HEMU-AI is available to users under 18. We collect only what’s needed
          to run the service, and we encourage guardians to supervise use.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          5. Data Storage and Security
        </h2>
        <p>
          We use Clerk, Stripe, Cloudflare R2, and Neon—all of which employ
          strong encryption in transit and at rest. Only authorized personnel
          can access user data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          6. Account and Data Deletion
        </h2>
        <p>
          You can delete your account and all associated data at any time via
          your dashboard. This action is immediate and irreversible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          7. Your Rights Under GDPR
        </h2>
        <p>
          As an EU user, you have rights to access, correct, or delete your
          data, restrict processing, and lodge a complaint. To exercise any
          right, email us at{" "}
          <a
            href="mailto:mrnaakka@gmail.com"
            className="text-teal-600 underline"
          >
            mrnaakka@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          8. Changes to This Policy
        </h2>
        <p>
          We may update this policy occasionally. Significant changes will be
          communicated via the platform or email. Continued use indicates
          acceptance.
        </p>
      </section>

      <footer className="border-t pt-4">
        <Link href="/" className="text-teal-600 underline">
          Back to Home
        </Link>
      </footer>
    </main>
  );
}
