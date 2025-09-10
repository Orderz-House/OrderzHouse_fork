import React from "react";

const Loader = () => {
  return (
    <>
      <style>
        {`
          .loader-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .loader {
            width: 48px;
            height: 48px;
            border: 3px solid #FFF;
            border-radius: 50%;
            display: inline-block;
            position: relative;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }

          .loader::after {
            content: '';
            box-sizing: border-box;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid;
            border-color: #22c55e transparent; /* Changed to green */
          }

          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="loader-wrapper">
        <span className="loader"></span>
      </div>
    </>
  );
};

export default Loader;
