export default function DataDeletion() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">User Data Deletion</h1>
      
      <div className="space-y-6">
        <section>
          <p className="text-lg">
            Post 2 Post allows you to schedule and publish content to your social media accounts. 
            If you wish to remove our access to your accounts and delete your data from our systems, 
            you can do so at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How to disconnect your accounts</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log into your Post 2 Post dashboard.</li>
            <li>Go to the <strong>Settings</strong> page from the sidebar.</li>
            <li>Click the "Disconnect" button next to your connected Meta accounts.</li>
            <li>This will instantly revoke our access and remove your access tokens from our database.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How to completely delete your account data</h2>
          <p className="mb-2">
            To completely delete your Post 2 Post account and all associated data (including your post history):
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Send an email to <strong>support@post2post.com</strong> with the subject "Data Deletion Request".</li>
            <li>Include the email address associated with your Post 2 Post account.</li>
            <li>We will process your request and permanently delete your data within 7 business days.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Revoking access via Facebook</h2>
          <p>
            You can also manually revoke our app's access directly from your Facebook settings:
          </p>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Go to your Facebook account's <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
            <li>Click on <strong>Business Integrations</strong>.</li>
            <li>Find "Post 2 Post" in the list and click <strong>Remove</strong>.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
