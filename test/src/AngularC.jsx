import React, { useEffect, useRef } from "react";

// The Angular microservice component
const AngularMicroservice = ({ data, onEvent }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically load the Angular script
    const script = document.createElement("script");
    script.src = "https://ai-bot-website.web.app/og-ai.js";
    script.onload = () => {
      // Access the exposed API
      window.AngularMicroservice.initAngularMicroservice(
        containerRef.current.id
      );
      window.AngularMicroservice.renderAngularComponent({
        data: data,
        eventCallback: onEvent,
      });
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      document.body.removeChild(script);
    };
  }, [data, onEvent]);

  return <div id="angular-container" ref={containerRef}></div>;
};

export default AngularMicroservice;
