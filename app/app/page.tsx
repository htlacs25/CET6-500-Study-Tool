// Both the server URL and the D-drive launcher use the same generated curriculum.
export default function Page() {
  return (
    <main style={{ height: '100dvh', overflow: 'hidden', background: '#f5f1e8' }}>
      <iframe
        title="六级500分每日学习工具"
        src="/六级学习工具.html"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </main>
  );
}
