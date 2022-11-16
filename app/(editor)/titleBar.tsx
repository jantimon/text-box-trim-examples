export const TitleBar = ({ className }: { className?: string }) => {
  return <div className={className} style={{ display: 'flex', flexDirection: "row-reverse", padding: 4 }}>
        <a href="https://github.com/jantimon/leading-trim-examples" title="Github Repository">
            <img alt="Github Logo" src="/github.png" style={{height: 24}} />
        </a>
    </div>;
};
