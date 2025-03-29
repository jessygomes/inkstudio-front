// import { BackButton } from "./BackButton";
// import { Social } from "./Social";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  // backButtonLabel: string;
  // backButtonHref: string;
  // showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
}: // backButtonLabel,
// backButtonHref,
// showSocial = false,
CardWrapperProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-500 shadow-[0px_8px_4px_0px_rgba(0,0,0,0.35)] rounded-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-black font-krub text-center uppercase w-full">
          {headerLabel}
        </h1>
      </div>

      <div>{children}</div>

      {/* {showSocial && (
        <div>
          <Social />
        </div>
      )} */}

      {/* <div>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </div> */}
    </div>
  );
};
