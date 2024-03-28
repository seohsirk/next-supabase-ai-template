import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

interface Props {
  productName: string;
  userDisplayName: string;
}

export function renderAccountDeleteEmail(props: Props) {
  const previewText = `We have deleted your ${props.productName} account`;

  return render(
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body className="mx-auto my-auto bg-gray-50 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-lg border border-solid border-[#eaeaea] bg-white p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-bold text-black">
              {previewText}
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">
              Hello {props.userDisplayName},
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              This is to confirm that we&apos;ve processed your request to
              delete your account with {props.productName}.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              We&apos;re sorry to see you go. Please note that this action is
              irreversible, and we&apos;ll make sure to delete all of your data
              from our systems.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              We thank you again for using {props.productName}.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              Best,
              <br />
              The {props.productName} Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>,
  );
}
