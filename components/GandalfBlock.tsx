"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface GandalfBlockProps {
  interviewId: string;
  message?: string;
}

export function GandalfBlock({ interviewId, message = "You didn't answer enough questions correctly!" }: GandalfBlockProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black overflow-y-auto"
    >
      <div className="min-h-full flex flex-col items-center justify-start pt-8 pb-16">
      <style jsx>{`
        @keyframes floating {
          to {
            transform: translateY(1.5rem);
          }
        }

        @keyframes fireGlow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }

        .gandalf {
          position: relative;
          width: 400px;
          height: 400px;
          animation: floating 1s infinite alternate ease-in-out;
        }

        .gandalf > div {
          position: absolute;
        }

        .gandalf::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 400px;
          height: 400px;
          background-color: #1a2130;
          border-radius: 50%;
        }

        .fireball {
          bottom: -10px;
          left: 50px;
          width: 300px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(#EFAC41, #DE8531, #6C1305, black);
          border: 5px solid #000;
          animation: fireGlow 0.5s infinite alternate;
        }

        .skirt {
          bottom: 50px;
          left: 100px;
          border-bottom: 230px solid #ededed;
          border-left: 100px solid transparent;
          border-right: 100px solid transparent;
          filter: drop-shadow(0 0 6px #d4d4d4);
        }

        .skirt::before {
          content: "";
          position: absolute;
          background-color: #ededed;
          width: 100px;
          height: 21px;
          top: 230px;
          left: 0px;
          border-bottom-right-radius: 180%;
          border-bottom-left-radius: 100%;
        }

        .skirt::after {
          content: "";
          position: absolute;
          background-color: #ededed;
          width: 100px;
          height: 28px;
          top: 230px;
          left: -100px;
          border-bottom-right-radius: 80%;
          border-bottom-left-radius: 180%;
        }

        .sleeves::before,
        .sleeves::after {
          content: "";
          position: absolute;
          border-bottom: 70px solid #ededed;
          filter: drop-shadow(0 0 6px #d4d4d4);
        }

        .sleeves::before {
          top: 130px;
          left: 191px;
          border-left: 100px solid transparent;
          border-right: 40px solid transparent;
          transform: rotate(-34deg);
        }

        .sleeves::after {
          top: 127px;
          left: 70px;
          border-left: 40px solid transparent;
          border-right: 100px solid transparent;
          transform: rotate(41deg);
        }

        .shoulders {
          background-color: #ededed;
          border-radius: 50%;
          width: 100px;
          height: 130px;
          left: 150px;
          top: 120px;
        }

        .hand {
          position: absolute;
          width: 33px;
          height: 26px;
          border-radius: 50%;
          background-color: #ffd8ad;
          top: -6px;
        }

        .hand.left {
          left: -70px;
          transform: rotate(-20deg);
        }

        .hand.left::after {
          content: "";
          position: absolute;
          background-color: #e6e6e6;
          width: 126px;
          height: 8px;
          border-radius: 4px;
          transform: rotate(-105deg);
          transform-origin: bottom;
          top: -48px;
          left: -56px;
        }

        .hand.right {
          right: -70px;
          transform: rotate(20deg);
        }

        .hand.right::after {
          content: "";
          position: absolute;
          background-color: #bf5507;
          width: 250px;
          height: 5px;
          border-radius: 2.5px;
          transform: rotate(-78deg);
          transform-origin: left;
          bottom: -100px;
          left: 0;
        }

        .head {
          width: 80px;
          height: 90px;
          top: 80px;
          left: 160px;
          background-color: #ffd8ad;
          border-radius: 50%;
        }

        .head::before,
        .head::after {
          content: "";
          position: absolute;
          background-color: #000;
        }

        .head::before {
          width: 13px;
          height: 5px;
          border-radius: 3px;
          top: 42px;
          left: 22px;
          transform: rotate(19deg);
        }

        .head::after {
          width: 13px;
          height: 5px;
          border-radius: 3px;
          top: 42px;
          right: 22px;
          transform: rotate(-19deg);
        }

        .hair {
          position: absolute;
          width: 70px;
          height: 30px;
          background-color: #c2beb5;
          border-radius: 50%;
          top: 0px;
          left: 5px;
        }

        .hair::before,
        .hair::after {
          content: "";
          position: absolute;
          background-color: #c2beb5;
          filter: drop-shadow(2px 5px 0 #aca89f);
        }

        .hair::before {
          top: 13px;
          left: -16px;
          width: 25px;
          height: 100px;
          border-top-left-radius: 34px;
          border-top-right-radius: 15px;
          border-bottom-left-radius: 100px;
          border-bottom-right-radius: 20px;
          transform: rotate(8deg);
        }

        .hair::after {
          top: 13px;
          right: -16px;
          width: 25px;
          height: 100px;
          border-top-left-radius: 15px;
          border-top-right-radius: 34px;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 100px;
          transform: rotate(-10deg);
        }

        .beard {
          position: absolute;
          top: 64px;
          left: 5px;
          border-top: 80px solid #c2beb5;
          border-left: 35px solid transparent;
          border-right: 35px solid transparent;
          border-radius: 30px;
          filter: drop-shadow(2px 5px 0 #aca89f);
        }

        .beard::before {
          content: "";
          position: absolute;
          background-color: pink;
          width: 20px;
          height: 5px;
          border-radius: 40%;
          top: -70px;
          left: -9px;
        }
      `}</style>

      <div className="gandalf">
        <div className="fireball"></div>
        <div className="skirt"></div>
        <div className="sleeves"></div>
        <div className="shoulders">
          <div className="hand left"></div>
          <div className="hand right"></div>
        </div>
        <div className="head">
          <div className="hair"></div>
          <div className="beard"></div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 max-w-lg px-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          403 - You Shall Not Pass
        </h1>
        <p className="text-white/70 text-lg mb-8">
          Uh oh, Gandalf is blocking the way!<br/>
          <span className="text-red-400">{message}</span>
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/interview/report?id=${interviewId}`)}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          Show Report
        </motion.button>

        <button
          onClick={() => router.push('/dashboard')}
          className="block mx-auto mt-4 text-white/50 hover:text-white transition-colors"
        >
          Back to Dashboard
        </button>
      </motion.div>
      </div>
    </motion.div>
  );
}

