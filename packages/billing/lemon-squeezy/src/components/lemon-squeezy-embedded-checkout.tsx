interface LemonSqueezyWindow extends Window {
  createLemonSqueezy: () => void;
  LemonSqueezy: {
    Setup: (options: {
      eventHandler: (event: { event: string }) => void;
    }) => void;
    Refresh: () => void;

    Url: {
      Open: (url: string) => void;
      Close: () => void;
    };
  };
}

export function LemonSqueezyEmbeddedCheckout(props: { checkoutToken: string }) {
  return (
    <script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      defer
      onLoad={() => {
        const win = window as unknown as LemonSqueezyWindow;

        win.createLemonSqueezy();
        win.LemonSqueezy.Url.Open(props.checkoutToken);
      }}
    ></script>
  );
}
