export const TitleBar = ({ className }: { className?: string }) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        gap: 8,
        alignItems: "center",
        margin: "6px 4px",
      }}
    >
      <a
        href="https://github.com/jantimon/leading-trim-examples"
        title="Github Repository"
      >
        <img alt="Github Logo" src="/github.png" style={{ height: 24 }} />
      </a>
      <ShareButton />
    </div>
  );
};

const ShareButton = () => {
  return (
    <button
      className="share"
      onClick={async () => {
        const url = window.location.href;
        const title = document.title;
        try {
          await navigator.share({ url, title });
        } catch (e) {
          await navigator.clipboard.writeText(url);
        }
      }}
    >
      Share
    </button>
  );
};
