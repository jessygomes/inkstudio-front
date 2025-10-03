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
    <div className="w-full max-w-[550px] mx-auto flex flex-col gap-4 p-4 rounded-2xl">
      <div className="flex flex-col justify-between items-center">
        <h1 className="text-xl sm:text-2xl p-2 rounded-[20px] text-white font-one text-center uppercase w-full">
          {headerLabel}
        </h1>
        <div className="h-[1px] bg-white/50 w-full" />
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
