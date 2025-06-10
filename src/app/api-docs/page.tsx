"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <div>Loading API docs...</div>
});

export default function ApiDoc() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then(response => response.json())
      .then(data => setSpec(data));
  }, []);

  if (!spec) {
    return <div>Loading...</div>;
  }

  return <SwaggerUI spec={spec} />;
}
