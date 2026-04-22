import React from "react";
import BrandLogo from "./BrandLogo";

const Footer = () => {
  const brandName = "Study \u092e\u093f\u0924\u094d\u0930";

  return (
    <footer className="bg-gray-900 py-12 text-gray-400">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
        <div>
          <BrandLogo to={null} imageClassName="w-[170px] md:w-[200px]" />
          <p className="mt-4 text-sm">
            Your AI-powered study companion for smarter and more focused learning.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-medium text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>Features</li>
            <li>How it Works</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-medium text-white">Contact</h4>
          <p className="text-sm">support@studymitra.ai</p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-500">
        Copyright {new Date().getFullYear()} {brandName}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
