import { Link } from 'react-router-dom';

const APP_NAME = 'Drive File Manager';
const CONTACT_EMAIL = 'tranduong1812003@gmail.com';
const UPDATED = 'October 26, 2026';

const GOOGLE_POLICY = 'https://developers.google.com/terms/api-services-user-data-policy';
const GOOGLE_PERMISSIONS = 'https://myaccount.google.com/permissions';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-3xl mx-auto px-4 py-8 bg-white min-h-screen space-y-3 leading-relaxed">
                <Link to="/login" className="text-sm text-blue-600 hover:underline">← {APP_NAME}</Link>

                <h1 className="text-2xl font-semibold">Privacy Policy</h1>
                <p className="text-sm text-gray-500">Last updated: {UPDATED}</p>

                <h2 className="text-lg font-semibold mt-6">1. What the app does</h2>
                <p>
                    {APP_NAME} lets you upload, view, rename, move and delete files in your own Google Drive. It
                    uses the <code>drive.file</code> scope, so it can only access files you upload through the
                    app or explicitly select with Google Picker. It cannot see any other files in your Drive.
                </p>

                <h2 className="text-lg font-semibold mt-6">2. Data we collect and store</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>Your Google account email, name and profile picture.</li>
                    <li>Google OAuth access and refresh tokens, stored encrypted (AES-GCM).</li>
                    <li>File metadata: name, type, size, folder and Google Drive file ID.</li>
                </ul>
                <p>
                    We <b>do not store the content of your files</b>. Your files always remain in your Google Drive.
                </p>

                <h2 className="text-lg font-semibold mt-6">3. How we use your data</h2>
                <p>
                    Data is used only to provide the file management features described above. We do not sell
                    your data, share it with third parties, or use it for advertising.
                </p>

                <h2 className="text-lg font-semibold mt-6">4. Google API Services User Data Policy</h2>
                <p>
                    {APP_NAME}'s use and transfer of information received from Google APIs adheres to the{' '}
                    <a className="text-blue-600 underline" href={GOOGLE_POLICY} target="_blank" rel="noreferrer">
                        Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements.
                </p>

                <h2 className="text-lg font-semibold mt-6">5. Deleting your data and revoking access</h2>
                <p>
                    You can revoke access at any time at{' '}
                    <a className="text-blue-600 underline" href={GOOGLE_PERMISSIONS} target="_blank" rel="noreferrer">
                        myaccount.google.com/permissions
                    </a>
                    . To request deletion of the data we store (account, tokens, metadata), email{' '}
                    <a className="text-blue-600 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                    Files in your Google Drive are not affected.
                </p>

                <h2 className="text-lg font-semibold mt-6">6. Contact</h2>
                <p>{CONTACT_EMAIL}</p>
            </main>
        </div>
    );
}