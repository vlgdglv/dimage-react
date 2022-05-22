import React from "react";
import Footer from "../components/Footer";

const Error = () => 
            <div>
              <h1 className="text-center" style={{ paddingTop:"150px",paddingLeft:"auto" }}>
                Error! Resource not available
              </h1>
              <div className="fixed-bottom"><Footer /></div>
            </div>;

export default Error;