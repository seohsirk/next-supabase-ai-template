import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const EmbeddedStripeCheckout = dynamic(
  () => {
    return import('../../components/embedded-stripe-checkout');
  },
  {
    ssr: false,
  },
);

function RecoverCheckout({ clientSecret }: { clientSecret: string }) {
  const router = useRouter();

  return (
    <EmbeddedStripeCheckout
      clientSecret={clientSecret}
      onClose={() => {
        return router.replace('/settings/subscription');
      }}
    />
  );
}

export default RecoverCheckout;
