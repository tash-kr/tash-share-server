export async function GET() {
  const data = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.MAL.tash",
        sha256_cert_fingerprints: ["YOUR_SHA256_FINGERPRINT_HERE"],
      },
    },
  ];
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
