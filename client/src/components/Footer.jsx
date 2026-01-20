import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto">
            <p>© {new Date().getFullYear()} Roadmap Gen. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
