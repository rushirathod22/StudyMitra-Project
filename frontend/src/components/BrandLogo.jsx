import { Link } from "react-router-dom";
import brandLogo from "../assets/Stusymitra_icon.png";

export default function BrandLogo({
  to = "/",
  centered = false,
  imageClassName = "",
}) {
  const brandName = "Study \u092e\u093f\u0924\u094d\u0930";

  const content = (
    <div className={`flex items-center ${centered ? "justify-center" : ""}`.trim()}>
      <img
        src={brandLogo}
        alt={brandName}
        className={`h-auto w-[180px] object-contain md:w-[210px] ${imageClassName}`.trim()}
      />
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label={`${brandName} home`}>
      {content}
    </Link>
  );
}
