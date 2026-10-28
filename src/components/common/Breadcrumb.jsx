import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {

  const { pathname = "" } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const segmentToLabel = (segment) => {
    const decoded = decodeURIComponent(segment);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  };
  
  const items = segments.map((seg, idx) => {

    const isLast = idx === segments.length - 1;
    const href = "/" + segments.slice(0, idx + 1).join("/");

    if (isLast) {
      return <li className="breadcrumb-item active" aria-current="page" key={href}>{segmentToLabel(seg)}</li>
    }

    return (
      <li className="breadcrumb-item" key={href}>
        <Link to={href}>{segmentToLabel(seg)}</Link>
      </li>
    )
  });

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb m-0">
        {items}
      </ol>
    </nav>
  )
}

export default Breadcrumb